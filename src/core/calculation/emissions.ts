/**
 * Emissions Orchestrator
 * Aggregates all sector-specific calculations into a single result.
 *
 * @module core/calculation/emissions
 */

import type { AssessmentAnswers, CalculationResult } from '../../types/assessment';
import { calculateTotalTransportEmission, getTransportSubBreakdown } from './transport';
import { calculateTotalEnergyEmission } from './energy';
import { calculateTotalFoodEmission } from './food';
import { calculateTotalWasteEmission } from './waste';
import { calculateTotalShoppingEmission } from './shopping';
import { calculateConfidence } from './confidence';
import { datasets } from '../../data/datasets';

/**
 * Orchestrate all calculations to produce a final result.
 * All formulas live in domain-specific modules — never in React components.
 *
 * Data flow:
 *   User Inputs → Scientific Calculation Engine → Verified Carbon Footprint
 */
export function calculateEmissions(answers: AssessmentAnswers): CalculationResult {
  const householdMembers = Math.max(1, answers.householdMembers || 1);
  const state = answers.state || 'Delhi';

  // 1. Energy (electricity, cooking fuel, appliances)
  const energyResult = calculateTotalEnergyEmission({
    electricityKWhKnown: answers.electricityKWhKnown,
    electricityKWh: answers.electricityKWh,
    monthlyBillRupees: answers.monthlyBillRupees,
    cookingFuel: answers.cookingFuel,
    cookingFuelConsumptionMonthly: answers.cookingFuelConsumptionMonthly,
    solarInstalledKw: answers.solarInstalledKw,
    appliances: answers.appliances,
    householdMembers,
    dwelling: answers.dwelling,
    state,
  });

  // 2. Transport (vehicles, flights, public transit)
  const transportTotal = calculateTotalTransportEmission({
    transportEntries: answers.transportEntries as any,
    ownsVehicle: answers.ownsVehicle,
    vehicleCategoryKey: answers.vehicleCategoryKey,
    dailyVehicleKm: answers.dailyVehicleKm,
    vehicleOccupancy: answers.vehicleOccupancy,
    flightDetails: answers.flightDetails,
    publicTransitModes: answers.publicTransitModes,
  }, energyResult.gridFactor);

  const transportSub = getTransportSubBreakdown({
    transportEntries: answers.transportEntries as any,
    ownsVehicle: answers.ownsVehicle,
    vehicleCategoryKey: answers.vehicleCategoryKey,
    dailyVehicleKm: answers.dailyVehicleKm,
    vehicleOccupancy: answers.vehicleOccupancy,
    flightDetails: answers.flightDetails,
    publicTransitModes: answers.publicTransitModes,
  }, energyResult.gridFactor);

  // 3. Food (diet, waste, dining out)
  const foodTotal = calculateTotalFoodEmission({
    dietType: answers.dietType,
    dietMix: answers.dietMix as any,
    foodWasteLevel: answers.foodWasteLevel,
    diningOutMealsWeekly: answers.diningOutMealsWeekly,
  });

  // 4. Waste (municipal solid waste, composting, recycling)
  const wasteTotal = calculateTotalWasteEmission({
    isUrban: answers.isUrban,
    wasteSegregation: answers.wasteSegregation,
    compostingOrganic: answers.compostingOrganic,
    recyclingDryWaste: answers.recyclingDryWaste,
  });

  // 5. Shopping (apparel, electronics, delivery)
  const shoppingTotal = calculateTotalShoppingEmission({
    apparelItemsMonthly: answers.apparelItemsMonthly,
    electronicsItemsYearly: answers.electronicsItemsYearly,
    onlineParcelsMonthly: answers.onlineParcelsMonthly,
    preferSecondHand: answers.preferSecondHand,
  });

  // ── Totals & Percentages ─────────────────────────────────────────────────
  const totalKg = Math.round((energyResult.total + transportTotal + foodTotal + wasteTotal + shoppingTotal) * 10) / 10;
  const totalTonnes = Math.round((totalKg / 1000) * 100) / 100;

  const breakdown = {
    energy: energyResult.total,
    transport: transportTotal,
    food: foodTotal,
    waste: wasteTotal,
    shopping: shoppingTotal,
  };

  const percentages = {
    energy: Math.round((breakdown.energy / totalKg) * 100) || 0,
    transport: Math.round((breakdown.transport / totalKg) * 100) || 0,
    food: Math.round((breakdown.food / totalKg) * 100) || 0,
    waste: Math.round((breakdown.waste / totalKg) * 100) || 0,
    shopping: Math.round((breakdown.shopping / totalKg) * 100) || 0,
  };

  // ── Confidence (always computed, never hardcoded) ────────────────────────
  const confidence = calculateConfidence(answers);

  return {
    totalKgCO2PerYear: totalKg,
    totalTonnesCO2PerYear: totalTonnes,
    breakdown,
    percentages,
    subBreakdown: {
      electricity: energyResult.electricity,
      cookingFuel: energyResult.cookingFuel,
      appliances: energyResult.appliances,
      vehicles: transportSub.vehicles,
      flights: transportSub.flights,
      publicTransit: transportSub.publicTransit,
    },
    confidence,
    metadata: {
      calculatorVersion: '2.2.0',
      datasetVersion: datasets.meta.version,
      calculatedAt: new Date().toISOString(),
      gridFactorUsed: energyResult.gridFactor,
      state,
    },
  };
}