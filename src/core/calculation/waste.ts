/**
 * Waste Emission Calculator
 * Calculates CO2 from municipal solid waste, composting, and recycling.
 *
 * Sources:
 * - CPCB (Central Pollution Control Board) per-capita waste averages
 * - MoEFCC methane emission factors
 *
 * @module core/calculation/waste
 */

import { wasteDataset } from '../../data/datasets';

/**
 * Calculate total waste sector emission.
 *
 * @param params - Waste-related assessment answers
 * @returns Annual waste CO2 emission in kg (minimum 25 kg floor)
 */
export function calculateTotalWasteEmission(params: {
  isUrban?: boolean;
  wasteSegregation?: boolean;
  compostingOrganic?: boolean;
  recyclingDryWaste?: boolean;
}): number {
  const dailyWasteKg = params.isUrban === false
    ? wasteDataset.ruralPerCapitaDailyKgWaste
    : wasteDataset.urbanPerCapitaDailyKgWaste;

  let annualBaseEmission = dailyWasteKg * 365 * wasteDataset.landfillMethaneFactorKgCO2PerKg;

  // Composting credit (organic food waste stream)
  if (params.compostingOrganic) {
    annualBaseEmission +=
      (0.25 * dailyWasteKg * 365) * wasteDataset.wasteStreams.organic_food.compostingCreditKgCO2PerKg;
  }

  // Recycling credit (dry plastic waste stream)
  if (params.recyclingDryWaste) {
    annualBaseEmission +=
      (0.20 * dailyWasteKg * 365) * wasteDataset.wasteStreams.plastic.recyclingCreditKgCO2PerKg;
  }

  return Math.max(25, annualBaseEmission);
}