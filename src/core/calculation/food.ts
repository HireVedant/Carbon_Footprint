/**
 * Food Emission Calculator
 * Calculates CO2 from diet, food waste, and dining out.
 *
 * Sources:
 * - ICAR (Indian Council of Agricultural Research) dietary emission benchmarks
 * - FAO food waste multipliers
 *
 * @module core/calculation/food
 */

import { foodDataset } from '../../data/datasets';
import { FOOD_CATEGORIES, DietMixEntry } from '../../data/configs/foodConfig';

/**
 * Calculate food emission from multi-select diet mix.
 * Weighted sum: each category's weight × base annual emission.
 */
export function calculateMultiDietEmission(dietMix: DietMixEntry[]): number {
  let total = 0;
  let totalWeight = 0;
  for (const entry of dietMix) {
    const category = FOOD_CATEGORIES.find(c => c.id === entry.foodId);
    if (!category) continue;
    const weight = Math.max(0, Math.min(1, entry.weight || 0));
    total += weight * category.baseAnnualKgCO2;
    totalWeight += weight;
  }
  if (totalWeight > 0 && totalWeight !== 1.0) {
    total = (total / totalWeight) * 1.0;
  }
  return total;
}

/**
 * Calculate food emission from legacy single diet type.
 */
export function calculateLegacyDietEmission(dietType: string): number {
  const rawKey = (dietType as string) || 'lacto_vegetarian';
  const dietKey = rawKey === 'high_red_meat' ? 'mixed_non_veg' : rawKey;
  const profile = foodDataset.dietProfiles[dietKey] || foodDataset.dietProfiles['lacto_vegetarian'];
  return profile.baseAnnualKgCO2;
}

/**
 * Calculate total food sector emission.
 */
export function calculateTotalFoodEmission(params: {
  dietType?: string;
  dietMix?: DietMixEntry[];
  foodWasteLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  diningOutMealsWeekly?: number;
}): number {
  // Multi-diet (preferred) vs legacy
  let baseDietEmission = 0;
  if (params.dietMix && params.dietMix.length > 0) {
    baseDietEmission = calculateMultiDietEmission(params.dietMix);
  } else {
    baseDietEmission = calculateLegacyDietEmission(params.dietType || 'lacto_vegetarian');
  }

  const wasteMultiplierKey = params.foodWasteLevel || 'MODERATE';
  const wasteMultiplier = foodDataset.foodWasteMultipliers[wasteMultiplierKey];
  const diningOutAddon = (params.diningOutMealsWeekly || 1) * 52 * foodDataset.diningOutAddonKgCO2PerMeal;

  return baseDietEmission * wasteMultiplier + diningOutAddon;
}