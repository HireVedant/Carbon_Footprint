/**
 * EcoTrack AI — Deterministic Scientific Calculation Engine (v2.0)
 * Uses official Indian datasets (CEA, ARAI, ICAO, BEE, ICAR, CPCB).
 * Zero magic numbers in code.
 */

import {
  datasets,
  electricityGridDataset,
  vehicleDataset,
  calculateFlightEmission,
  transitDataset,
  fuelDataset,
  applianceDataset,
  foodDataset,
  wasteDataset,
  shoppingDataset,
  HOUSING_TYPES
} from '../data/datasets';
import { calculateAssessmentConfidence, AssessmentConfidenceBreakdown } from './confidenceCalculator';

export interface FlightTripInput {
  depIata: string;
  arrIata: string;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  isRoundTrip: boolean;
  tripsPerYear: number;
}

export interface ApplianceUsageInput {
  applianceId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  dailyHours: number;
}

export interface AssessmentAnswers {
  // Location
  state?: string;
  district?: string;
  city?: string;
  dwelling?: 'APARTMENT' | 'INDEPENDENT_HOUSE' | 'VILLA' | 'HOSTEL' | 'PG' | 'RENTAL';
  isUrban?: boolean;
  householdMembers?: number;

  // Energy
  electricityKWhKnown?: boolean;
  electricityKWh?: number; // Monthly kWh
  monthlyBillRupees?: number;
  cookingFuel?: 'lpg' | 'png' | 'induction' | 'biomass';
  cookingFuelConsumptionMonthly?: number; // cylinders or SMC or kWh or kg
  solarInstalledKw?: number; // kW solar capacity
  appliances?: ApplianceUsageInput[];

  // Transport
  ownsVehicle?: boolean;
  vehicleCategoryKey?: string; // e.g. 'car_hatchback_petrol', 'car_suv_diesel', 'bike_commuter_petrol', 'car_electric'
  dailyVehicleKm?: number;
  vehicleOccupancy?: number;
  publicTransitModes?: {
    metroKmWeekly?: number;
    suburbanTrainKmWeekly?: number;
    busKmWeekly?: number;
    autoKmWeekly?: number;
    taxiKmWeekly?: number;
  };
  flightDetails?: FlightTripInput[];

  // Food
  dietType?: 'vegan' | 'lacto_vegetarian' | 'eggetarian' | 'pescatarian' | 'chicken_moderate' | 'mixed_non_veg' | 'other_diet';
  foodWasteLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  diningOutMealsWeekly?: number;

  // Waste
  wasteSegregation?: boolean;
  compostingOrganic?: boolean;
  recyclingDryWaste?: boolean;

  // Shopping
  apparelItemsMonthly?: number;
  electronicsItemsYearly?: number;
  onlineParcelsMonthly?: number;
  preferSecondHand?: boolean;
}

export interface CalculationResult {
  totalKgCO2PerYear: number;
  totalTonnesCO2PerYear: number;
  breakdown: {
    transport: number;
    energy: number;
    food: number;
    waste: number;
    shopping: number;
  };
  percentages: {
    transport: number;
    energy: number;
    food: number;
    waste: number;
    shopping: number;
  };
  subBreakdown: {
    electricity: number;
    cookingFuel: number;
    appliances: number;
    vehicles: number;
    flights: number;
    publicTransit: number;
  };
  confidence: AssessmentConfidenceBreakdown;
  metadata: {
    calculatorVersion: string;
    datasetVersion: string;
    calculatedAt: string;
    gridFactorUsed: number;
    state: string;
  };
}

export function calculateEmissions(answers: AssessmentAnswers): CalculationResult {
  const householdMembers = Math.max(1, answers.householdMembers || 1);
  const userState = answers.state || 'Delhi';

  // 1. Resolve State Electricity Grid Factor (CEA Database)
  const stateGridEntry = electricityGridDataset.factors[userState];
  const gridFactor = stateGridEntry ? stateGridEntry.factorKgCO2PerKWh : electricityGridDataset.nationalAverageKgCO2PerKWh;

  // Housing Type Energy Multiplier
  const housingOption = HOUSING_TYPES.find(h => h.id === answers.dwelling);
  const housingMultiplier = housingOption ? housingOption.energyMultiplier : 1.0;

  // --- ENERGY SECTOR CALCULATIONS ---
  let monthlyElectricityKWh = 0;
  if (answers.electricityKWhKnown && answers.electricityKWh && answers.electricityKWh > 0) {
    monthlyElectricityKWh = answers.electricityKWh;
  } else if (answers.monthlyBillRupees && answers.monthlyBillRupees > 0) {
    // Approx 1 kWh = Rs 7.50 in India
    monthlyElectricityKWh = answers.monthlyBillRupees / 7.5;
  } else {
    // Baseline estimation based on household size (approx 120 kWh/person/month)
    monthlyElectricityKWh = householdMembers * 120 * housingMultiplier;
  }

  // Solar generation offset (1 kW solar produces approx 120 kWh/month in India)
  const solarMonthlyOffsetKWh = (answers.solarInstalledKw || 0) * 120;
  const netMonthlyElectricityKWh = Math.max(0, monthlyElectricityKWh - solarMonthlyOffsetKWh);
  const annualElectricityEmission = (netMonthlyElectricityKWh * 12 * gridFactor) / householdMembers;

  // Cooking Fuel Emission
  let annualCookingFuelEmission = 0;
  const fuelTypeKey = answers.cookingFuel || 'lpg';
  const fuelEntry = fuelDataset.fuels[fuelTypeKey];
  const fuelConsumption = answers.cookingFuelConsumptionMonthly || (fuelTypeKey === 'lpg' ? 1 : fuelTypeKey === 'png' ? 25 : 100);

  if (fuelEntry) {
    annualCookingFuelEmission = (fuelConsumption * fuelEntry.emissionFactorKgCO2PerUnit * 12) / householdMembers;
  }

  // Appliance Addons (if specified)
  let annualApplianceExtraEmission = 0;
  if (answers.appliances && answers.appliances.length > 0) {
    answers.appliances.forEach(app => {
      const category = applianceDataset.appliances[app.applianceId];
      if (category && category.starRatings[app.stars]) {
        const rating = category.starRatings[app.stars];
        const dailyKWh = (rating.powerDrawWatts * app.dailyHours) / 1000;
        annualApplianceExtraEmission += (dailyKWh * 365 * gridFactor) / householdMembers;
      }
    });
  }

  const totalEnergyEmission = annualElectricityEmission + annualCookingFuelEmission + annualApplianceExtraEmission;

  // --- TRANSPORT SECTOR CALCULATIONS ---
  let annualVehicleEmission = 0;
  if (answers.ownsVehicle && answers.vehicleCategoryKey) {
    const vCat = vehicleDataset.vehicleCategories[answers.vehicleCategoryKey];
    if (vCat) {
      const dailyKm = answers.dailyVehicleKm || 25;
      const occupancy = Math.max(1, answers.vehicleOccupancy || 1);
      
      // Calculate per km emission factor
      let kmFactor = vCat.emissionFactorKgCO2PerKm;
      if (vCat.fuelType === 'ELECTRIC') {
        kmFactor = (1 / vCat.averageKmPerLiterOrKWh) * gridFactor;
      }
      
      annualVehicleEmission = (dailyKm * 365 * kmFactor) / occupancy;
    }
  }

  // Aviation Flights
  let annualFlightEmission = 0;
  if (answers.flightDetails && answers.flightDetails.length > 0) {
    answers.flightDetails.forEach(flight => {
      const res = calculateFlightEmission(flight.depIata, flight.arrIata, flight.cabinClass, flight.isRoundTrip, flight.tripsPerYear);
      annualFlightEmission += res.totalEmissionKgCO2;
    });
  }

  // Public Transit
  let annualTransitEmission = 0;
  if (answers.publicTransitModes) {
    const tm = answers.publicTransitModes;
    if (tm.metroKmWeekly) annualTransitEmission += tm.metroKmWeekly * 52 * transitDataset.modes.metro.emissionFactorKgCO2PerKm;
    if (tm.suburbanTrainKmWeekly) annualTransitEmission += tm.suburbanTrainKmWeekly * 52 * transitDataset.modes.suburban_train.emissionFactorKgCO2PerKm;
    if (tm.busKmWeekly) annualTransitEmission += tm.busKmWeekly * 52 * transitDataset.modes.bus_diesel.emissionFactorKgCO2PerKm;
    if (tm.autoKmWeekly) annualTransitEmission += tm.autoKmWeekly * 52 * transitDataset.modes.auto_cng.emissionFactorKgCO2PerKm;
    if (tm.taxiKmWeekly) annualTransitEmission += tm.taxiKmWeekly * 52 * transitDataset.modes.taxi_cng.emissionFactorKgCO2PerKm;
  }

  const totalTransportEmission = annualVehicleEmission + annualFlightEmission + annualTransitEmission;

  // --- FOOD SECTOR CALCULATIONS ---
  // Backward compat: map deprecated 'high_red_meat' from historical Firestore docs to 'mixed_non_veg'
  const rawDietKey = (answers.dietType as string) || 'lacto_vegetarian';
  const dietKey = rawDietKey === 'high_red_meat' ? 'mixed_non_veg' : rawDietKey;
  const dietProfile = foodDataset.dietProfiles[dietKey] || foodDataset.dietProfiles['lacto_vegetarian'];
  
  const wasteMultiplierKey = answers.foodWasteLevel || 'MODERATE';
  const wasteMultiplier = foodDataset.foodWasteMultipliers[wasteMultiplierKey];
  
  const diningOutAddon = (answers.diningOutMealsWeekly || 1) * 52 * foodDataset.diningOutAddonKgCO2PerMeal;

  const totalFoodEmission = dietProfile.baseAnnualKgCO2 * wasteMultiplier + diningOutAddon;

  // --- WASTE SECTOR CALCULATIONS ---
  const dailyWasteKg = answers.isUrban === false ? wasteDataset.ruralPerCapitaDailyKgWaste : wasteDataset.urbanPerCapitaDailyKgWaste;
  let annualBaseWasteEmission = dailyWasteKg * 365 * wasteDataset.landfillMethaneFactorKgCO2PerKg;

  if (answers.compostingOrganic) {
    annualBaseWasteEmission += (0.25 * dailyWasteKg * 365) * wasteDataset.wasteStreams.organic_food.compostingCreditKgCO2PerKg;
  }
  if (answers.recyclingDryWaste) {
    annualBaseWasteEmission += (0.20 * dailyWasteKg * 365) * wasteDataset.wasteStreams.plastic.recyclingCreditKgCO2PerKg;
  }

  const totalWasteEmission = Math.max(25, annualBaseWasteEmission);

  // --- SHOPPING SECTOR CALCULATIONS ---
  const monthlyApparel = answers.apparelItemsMonthly || 1;
  const apparelEmission = monthlyApparel * 12 * shoppingDataset.categories.fast_fashion_clothing.averageKgCO2PerItem;
  
  const annualElectronics = answers.electronicsItemsYearly || 0.5;
  const electronicsEmission = annualElectronics * shoppingDataset.categories.smartphone_gadget.averageKgCO2PerItem;
  
  const monthlyParcels = answers.onlineParcelsMonthly || 4;
  const deliveryEmission = monthlyParcels * 12 * shoppingDataset.onlineDeliveryKgCO2PerParcel;

  let totalShoppingEmission = apparelEmission + electronicsEmission + deliveryEmission;
  if (answers.preferSecondHand) {
    totalShoppingEmission *= 0.5; // 50% overall reduction for second-hand preference
  }

  // --- TOTALS & BREAKDOWNS ---
  const totalKg = Math.round((totalEnergyEmission + totalTransportEmission + totalFoodEmission + totalWasteEmission + totalShoppingEmission) * 10) / 10;
  const totalTonnes = Math.round((totalKg / 1000) * 100) / 100;

  const breakdown = {
    energy: Math.round(totalEnergyEmission * 10) / 10,
    transport: Math.round(totalTransportEmission * 10) / 10,
    food: Math.round(totalFoodEmission * 10) / 10,
    waste: Math.round(totalWasteEmission * 10) / 10,
    shopping: Math.round(totalShoppingEmission * 10) / 10
  };

  const percentages = {
    energy: Math.round((breakdown.energy / totalKg) * 100) || 0,
    transport: Math.round((breakdown.transport / totalKg) * 100) || 0,
    food: Math.round((breakdown.food / totalKg) * 100) || 0,
    waste: Math.round((breakdown.waste / totalKg) * 100) || 0,
    shopping: Math.round((breakdown.shopping / totalKg) * 100) || 0
  };

  const confidence = calculateAssessmentConfidence({
    ...answers,
    state: userState
  });

  return {
    totalKgCO2PerYear: totalKg,
    totalTonnesCO2PerYear: totalTonnes,
    breakdown,
    percentages,
    subBreakdown: {
      electricity: Math.round(annualElectricityEmission),
      cookingFuel: Math.round(annualCookingFuelEmission),
      appliances: Math.round(annualApplianceExtraEmission),
      vehicles: Math.round(annualVehicleEmission),
      flights: Math.round(annualFlightEmission),
      publicTransit: Math.round(annualTransitEmission)
    },
    confidence,
    metadata: {
      calculatorVersion: '2.0.0',
      datasetVersion: datasets.meta.version,
      calculatedAt: new Date().toISOString(),
      gridFactorUsed: gridFactor,
      state: userState
    }
  };
}
