import { EMISSION_FACTORS } from '../constants/emissionFactors';

/**
 * Calculator version 1 assumptions:
 * - Flights use a fixed prototype per-flight estimate.
 * - LPG uses a one-cylinder-per-month prototype assumption.
 * - Electricity bill mode uses the prototype bill-to-emissions estimate.
 *
 * Historical reports and leaderboard entries depend on these assumptions.
 * Changing formulas requires a future versioned calculator path and migration plan.
 * This constant is documentation only and is not written to Firestore reports.
 */
export const CALCULATOR_VERSION = 1;
export interface CalculatorInputs {
  // Step 1: Transportation
  primaryTransport: 'walk' | 'cycle' | 'bus' | 'train' | 'bike' | 'car' | 'auto';
  distanceTravelled: number; // km/day
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric';
  flightsPerYear: number;

  // Step 2: Energy
  electricityType: 'units' | 'bill';
  electricityValue: number;
  cookingFuel: 'lpg' | 'png' | 'electric' | 'biomass';
  acUsage: 'yes' | 'no';
  acHours: number;
  heaterUsage: number; // hours/day
  electronicDevices: number;

  // Step 3: Food
  diet: 'vegan' | 'vegetarian' | 'non-vegetarian';
  meatFrequency: 'daily' | 'weekly' | 'occasionally' | 'never';
  beefMuttonFrequency: 'daily' | 'weekly' | 'occasionally' | 'never';
  foodWaste: 'low' | 'medium' | 'high';
  localFood: 'always' | 'mostly' | 'rarely' | 'never';

  // Step 4: Waste
  dailyWaste: 'low' | 'medium' | 'high';
  wasteSegregation: 'yes' | 'no';
  recycling: 'yes' | 'no';
  composting: 'yes' | 'no';
  clothesFrequency: 'monthly' | 'quarterly' | 'annually' | 'rarely';
}

export interface CalculationResult {
  transportEmissions: number; // kg CO2/year
  energyEmissions: number; // kg CO2/year
  foodEmissions: number; // kg CO2/year
  wasteEmissions: number; // kg CO2/year
  totalEmissions: number; // kg CO2/year
  annualEstimate: number; // tons CO2/year
  ecoScore: number; // 0-100
  ecoLabel: string;
  ecoColor: string;
}

/** Transport modes that consume personal vehicle fuel. */
export function transportRequiresFuel(
  transport: CalculatorInputs['primaryTransport']
): boolean {
  return transport === 'car' || transport === 'bike' || transport === 'auto';
}

/** Clamp invalid numeric input to a safe non-negative finite value. */
export function sanitizeNumber(value: unknown, fallback = 0): number {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return Math.max(0, fallback);
  return Math.max(0, numericValue);
}

export const initialInputs: CalculatorInputs = {
  primaryTransport: 'car',
  distanceTravelled: 15,
  fuelType: 'petrol',
  flightsPerYear: 0,

  electricityType: 'units',
  electricityValue: 150,
  cookingFuel: 'lpg',
  acUsage: 'no',
  acHours: 0,
  heaterUsage: 1,
  electronicDevices: 5,

  diet: 'vegetarian',
  meatFrequency: 'never',
  beefMuttonFrequency: 'never',
  foodWaste: 'medium',
  localFood: 'mostly',

  dailyWaste: 'medium',
  wasteSegregation: 'yes',
  recycling: 'yes',
  composting: 'no',
  clothesFrequency: 'quarterly',
};

export function mergeCalculatorInputs(
  storedInputs: Partial<CalculatorInputs> | null | undefined
): CalculatorInputs {
  return { ...initialInputs, ...(storedInputs ?? {}) };
}

function resolveTransportFactor(inputs: CalculatorInputs): number {
  const transportType = inputs.primaryTransport;
  const distance = sanitizeNumber(inputs.distanceTravelled);

  if (distance === 0) return 0;

  if (transportType === 'walk' || transportType === 'cycle') {
    return EMISSION_FACTORS.transport.walk;
  }

  if (transportType === 'bus' || transportType === 'train') {
    return EMISSION_FACTORS.transport[transportType];
  }

  if (transportRequiresFuel(transportType)) {
    const typeFactors = EMISSION_FACTORS.transport[transportType];
    return typeFactors[inputs.fuelType] ?? typeFactors.petrol;
  }

  return 0;
}

export function calculateCarbonFootprint(inputs: CalculatorInputs): CalculationResult {
  const distanceTravelled = sanitizeNumber(inputs.distanceTravelled);
  const flightsPerYear = sanitizeNumber(inputs.flightsPerYear);
  const electricityValue = sanitizeNumber(inputs.electricityValue);
  const acHours = sanitizeNumber(inputs.acHours);
  const heaterUsage = sanitizeNumber(inputs.heaterUsage);
  const electronicDevices = sanitizeNumber(inputs.electronicDevices);
  // 1. Transportation - km/day * 365 * kg CO2/km + flights/year * kg CO2/flight
  const transportFactor = resolveTransportFactor({ ...inputs, distanceTravelled });
  const annualCommuteEmissions = distanceTravelled * 365 * transportFactor;
  const annualFlightEmissions = flightsPerYear * EMISSION_FACTORS.flight;
  const transportEmissions = annualCommuteEmissions + annualFlightEmissions;
  // Prototype assumption:
  // Electricity units are monthly kWh. Bill mode treats the entered monthly bill
  // amount as an estimated emissions proxy through perRupee.
  // Historical calculations depend on this assumption; do not change without versioning.
  let electricityEmissions = 0;
  if (inputs.electricityType === 'units') {
    electricityEmissions = electricityValue * 12 * EMISSION_FACTORS.electricity.perUnit;
  } else {
    electricityEmissions = electricityValue * 12 * EMISSION_FACTORS.electricity.perRupee;
  }

  let cookingEmissions = 0;
  if (inputs.cookingFuel === 'lpg') {
    // Prototype assumption:
    // LPG usage is approximated as one cylinder per month.
    // Historical reports rely on this assumption; do not modify without versioning.
    cookingEmissions = EMISSION_FACTORS.cookingFuel.lpg * 12;
  } else if (inputs.cookingFuel === 'png') {
    // Prototype assumption: about 25 cubic meters/month * 12 months * kg CO2/cubic meter
    cookingEmissions = EMISSION_FACTORS.cookingFuel.png * 25 * 12;
  } else if (inputs.cookingFuel === 'electric') {
    cookingEmissions = EMISSION_FACTORS.cookingFuel.electric * 365;
  } else {
    cookingEmissions = EMISSION_FACTORS.cookingFuel.biomass * 365;
  }

  const acEmissions =
    inputs.acUsage === 'yes' ? acHours * 365 * EMISSION_FACTORS.appliances.acPerHour : 0;
  const heaterEmissions = heaterUsage * 365 * EMISSION_FACTORS.appliances.heaterPerHour;
  const deviceEmissions = electronicDevices * 365 * EMISSION_FACTORS.appliances.devicePerDay;

  const energyEmissions =
    electricityEmissions + cookingEmissions + acEmissions + heaterEmissions + deviceEmissions;
  // 3. Food - daily kg CO2 * 365
  const baseFoodEmissions = EMISSION_FACTORS.food.diet[inputs.diet] ?? EMISSION_FACTORS.food.diet.vegetarian;
  let meatMultiplier = 1.0;
  let beefMultiplier = 1.0;

  if (inputs.diet === 'non-vegetarian') {
    meatMultiplier = EMISSION_FACTORS.food.meatFrequencyMultiplier[inputs.meatFrequency] ?? 1.0;
    beefMultiplier =
      EMISSION_FACTORS.food.beefMuttonFrequencyMultiplier[inputs.beefMuttonFrequency] ?? 1.0;
  }

  const foodWasteEmissions = EMISSION_FACTORS.food.foodWaste[inputs.foodWaste] ?? 0.5;
  const localFoodBonus = EMISSION_FACTORS.food.localFoodBonus[inputs.localFood] ?? 0;

  const dailyFoodEmissions = Math.max(
    0.5,
    baseFoodEmissions * meatMultiplier * beefMultiplier + foodWasteEmissions + localFoodBonus
  );
  const foodEmissions = dailyFoodEmissions * 365;
  // 4. Waste - daily kg CO2 * 365
  const baseWasteEmissions = EMISSION_FACTORS.waste.dailyGeneration[inputs.dailyWaste] ?? 1.2;

  let wasteDiscountMultiplier = 1.0;
  if (inputs.wasteSegregation === 'yes') {
    wasteDiscountMultiplier += EMISSION_FACTORS.waste.segregationDiscount;
  }
  if (inputs.recycling === 'yes') {
    wasteDiscountMultiplier += EMISSION_FACTORS.waste.recyclingDiscount;
  }
  if (inputs.composting === 'yes') {
    wasteDiscountMultiplier += EMISSION_FACTORS.waste.compostingDiscount;
  }

  wasteDiscountMultiplier = Math.max(0.3, wasteDiscountMultiplier);

  const clothingEmissions =
    EMISSION_FACTORS.waste.clothesPurchasing[inputs.clothesFrequency] ?? 1.5;

  const dailyWasteEmissions = baseWasteEmissions * wasteDiscountMultiplier + clothingEmissions;
  const wasteEmissions = dailyWasteEmissions * 365;

  const totalEmissions = transportEmissions + energyEmissions + foodEmissions + wasteEmissions;
  const annualEstimate = parseFloat((totalEmissions / 1000).toFixed(2));

  const ecoScore = Math.max(1, Math.min(100, Math.round(100 - annualEstimate * 5.5)));

  let ecoLabel = '';
  let ecoColor = '';

  if (ecoScore >= 85) {
    ecoLabel = 'Eco Warrior';
    ecoColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (ecoScore >= 70) {
    ecoLabel = 'Conscious Citizen';
    ecoColor = 'text-green-400 border-green-500/30 bg-green-500/10';
  } else if (ecoScore >= 50) {
    ecoLabel = 'Average Consumer';
    ecoColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  } else if (ecoScore >= 30) {
    ecoLabel = 'High Impact';
    ecoColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  } else {
    ecoLabel = 'Carbon Heavy';
    ecoColor = 'text-red-400 border-red-500/30 bg-red-500/10';
  }

  return {
    transportEmissions: Math.round(transportEmissions),
    energyEmissions: Math.round(energyEmissions),
    foodEmissions: Math.round(foodEmissions),
    wasteEmissions: Math.round(wasteEmissions),
    totalEmissions: Math.round(totalEmissions),
    annualEstimate,
    ecoScore,
    ecoLabel,
    ecoColor,
  };
}
