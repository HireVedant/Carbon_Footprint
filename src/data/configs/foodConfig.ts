/**
 * Food/Diet configuration for the assessment UI.
 * Allows multi-selection of dietary categories with proportional weighting.
 * Based on ICAR & EAT-Lancet India dietary benchmarks.
 */

export interface FoodCategoryOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Base annual kg CO2 from food dataset */
  baseAnnualKgCO2: number;
}

/**
 * Simplified food categories as specified:
 * - Plant-Based Vegan
 * - Vegetarian
 * - Fish / Seafood
 * - Chicken
 * - Mutton
 *
 * Replaces the old single-select with eggetarian and mixed non-veg.
 */
export const FOOD_CATEGORIES: FoodCategoryOption[] = [
  {
    id: 'vegan',
    label: 'Plant-Based Vegan',
    icon: '🌱',
    description: 'Zero meat, zero dairy, zero eggs',
    baseAnnualKgCO2: 480.0,
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    icon: '🥬',
    description: 'Plant-based with dairy (milk, curd, paneer, ghee)',
    baseAnnualKgCO2: 680.0,
  },
  {
    id: 'fish',
    label: 'Fish / Seafood',
    icon: '🐟',
    description: 'Fish and seafood consumption',
    baseAnnualKgCO2: 950.0,
  },
  {
    id: 'chicken',
    label: 'Chicken',
    icon: '🍗',
    description: 'Poultry consumption',
    baseAnnualKgCO2: 1120.0,
  },
  {
    id: 'mutton',
    label: 'Mutton',
    icon: '🥩',
    description: 'Red meat (goat/mutton/lamb) consumption',
    baseAnnualKgCO2: 1580.0,
  },
];

/**
 * A user-selected food category with a weight (0-1) representing
 * what proportion of their diet falls into this category.
 */
export interface DietMixEntry {
  foodId: string;
  weight: number; // 0 to 1, all weights should sum to ~1.0
  label: string;
}