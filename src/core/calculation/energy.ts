/**
 * Energy Emission Calculator
 * Calculates CO2 from electricity, cooking fuel, and appliances.
 *
 * Sources:
 * - CEA (Central Electricity Authority) State-wise Grid Emission Factors
 * - BEE (Bureau of Energy Efficiency) appliance ratings
 * - MoEFCC cooking fuel emission factors
 *
 * @module core/calculation/energy
 */

import { electricityGridDataset, fuelDataset, applianceDataset, HOUSING_TYPES } from '../../data/datasets';
import type { ApplianceUsageInput } from '../../types/assessment';

/**
 * Resolve the electricity grid emission factor for a given state.
 * Falls back to national average if state not found.
 */
export function resolveGridFactor(state: string): number {
  const entry = electricityGridDataset.factors[state];
  return entry ? entry.factorKgCO2PerKWh : electricityGridDataset.nationalAverageKgCO2PerKWh;
}

/**
 * Calculate monthly electricity consumption in kWh.
 * Priority: Direct kWh > Bill-based estimation > Baseline estimation
 */
export function estimateMonthlyElectricityKWh(params: {
  electricityKWhKnown?: boolean;
  electricityKWh?: number;
  monthlyBillRupees?: number;
  householdMembers: number;
  dwelling?: string;
}): number {
  if (params.electricityKWhKnown && params.electricityKWh && params.electricityKWh > 0) {
    return params.electricityKWh;
  }
  if (params.monthlyBillRupees && params.monthlyBillRupees > 0) {
    // Approx 1 kWh = Rs 7.50 in India (avg tariff)
    return params.monthlyBillRupees / 7.5;
  }
  // Baseline: ~120 kWh/person/month adjusted by housing type
  const housingOption = HOUSING_TYPES.find(h => h.id === params.dwelling);
  const housingMultiplier = housingOption ? housingOption.energyMultiplier : 1.0;
  return params.householdMembers * 120 * housingMultiplier;
}

/**
 * Calculate annual electricity emission per household member.
 *
 * @param monthlyKWh - Monthly electricity consumption
 * @param solarKw - Installed solar capacity (kW)
 * @param gridFactor - State grid emission factor (kg CO2/kWh)
 * @param householdMembers - Number of household members
 * @returns Annual electricity CO2 emission in kg (per person)
 */
export function calculateElectricityEmission(
  monthlyKWh: number,
  solarKw: number,
  gridFactor: number,
  householdMembers: number
): number {
  // Solar offset: 1 kW produces ~120 kWh/month in India
  const solarMonthlyOffset = solarKw * 120;
  const netMonthly = Math.max(0, monthlyKWh - solarMonthlyOffset);
  return (netMonthly * 12 * gridFactor) / householdMembers;
}

/**
 * Calculate annual cooking fuel emission per household member.
 *
 * @param fuelType - Type of cooking fuel
 * @param consumptionMonthly - Monthly consumption in native units
 * @param householdMembers - Number of household members
 * @returns Annual cooking fuel CO2 emission in kg (per person)
 */
export function calculateCookingFuelEmission(
  fuelType: string,
  consumptionMonthly: number,
  householdMembers: number
): number {
  const fuelEntry = fuelDataset.fuels[fuelType];
  if (!fuelEntry) return 0;

  // Default consumption if not specified
  const defaultConsumption = fuelType === 'lpg' ? 1 : fuelType === 'png' ? 25 : 100;
  const safeConsumption = consumptionMonthly || defaultConsumption;

  return (safeConsumption * fuelEntry.emissionFactorKgCO2PerUnit * 12) / householdMembers;
}

/**
 * Calculate annual appliance emission per household member.
 *
 * @param appliances - Array of appliance usage inputs
 * @param gridFactor - State grid emission factor
 * @param householdMembers - Number of household members
 * @returns Annual appliance CO2 emission in kg (per person)
 */
export function calculateApplianceEmission(
  appliances: ApplianceUsageInput[],
  gridFactor: number,
  householdMembers: number
): number {
  let total = 0;
  for (const app of appliances) {
    const category = applianceDataset.appliances[app.applianceId];
    if (category && category.starRatings[app.stars]) {
      const rating = category.starRatings[app.stars];
      const dailyKWh = (rating.powerDrawWatts * app.dailyHours) / 1000;
      total += (dailyKWh * 365 * gridFactor) / householdMembers;
    }
  }
  return total;
}

/**
 * Calculate total energy sector emission.
 */
export function calculateTotalEnergyEmission(params: {
  electricityKWhKnown?: boolean;
  electricityKWh?: number;
  monthlyBillRupees?: number;
  cookingFuel?: string;
  cookingFuelConsumptionMonthly?: number;
  solarInstalledKw?: number;
  appliances?: ApplianceUsageInput[];
  householdMembers: number;
  dwelling?: string;
  state: string;
}): { total: number; electricity: number; cookingFuel: number; appliances: number; gridFactor: number } {
  const gridFactor = resolveGridFactor(params.state);
  const monthlyKWh = estimateMonthlyElectricityKWh({
    electricityKWhKnown: params.electricityKWhKnown,
    electricityKWh: params.electricityKWh,
    monthlyBillRupees: params.monthlyBillRupees,
    householdMembers: params.householdMembers,
    dwelling: params.dwelling,
  });

  const electricity = calculateElectricityEmission(
    monthlyKWh,
    params.solarInstalledKw || 0,
    gridFactor,
    params.householdMembers
  );

  const cookingFuel = calculateCookingFuelEmission(
    params.cookingFuel || 'lpg',
    params.cookingFuelConsumptionMonthly || 0,
    params.householdMembers
  );

  const appliances = params.appliances && params.appliances.length > 0
    ? calculateApplianceEmission(params.appliances, gridFactor, params.householdMembers)
    : 0;

  return {
    total: electricity + cookingFuel + appliances,
    electricity: Math.round(electricity),
    cookingFuel: Math.round(cookingFuel),
    appliances: Math.round(appliances),
    gridFactor,
  };
}