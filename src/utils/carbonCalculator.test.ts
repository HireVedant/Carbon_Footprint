import { describe, it, expect } from 'vitest';
import {
  CALCULATOR_VERSION,
  calculateCarbonFootprint,
  initialInputs,
  mergeCalculatorInputs,
  sanitizeNumber,
  transportRequiresFuel,
  type CalculatorInputs,
} from './carbonCalculator';
import { EMISSION_FACTORS } from '../constants/emissionFactors';

function withInputs(overrides: Partial<CalculatorInputs>): CalculatorInputs {
  return { ...initialInputs, ...overrides };
}


describe('calculator version documentation', () => {
  it('keeps version 1 as documentation-only metadata', () => {
    expect(CALCULATOR_VERSION).toBe(1);
  });
});

describe('prototype energy assumptions', () => {
  it('keeps electricity bill mode as monthly bill amount * 12 * perRupee', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        electricityType: 'bill',
        electricityValue: 1000,
        cookingFuel: 'electric',
        acUsage: 'no',
        acHours: 0,
        heaterUsage: 0,
        electronicDevices: 0,
        distanceTravelled: 0,
        flightsPerYear: 0,
      })
    );

    const billElectricity = 1000 * 12 * EMISSION_FACTORS.electricity.perRupee;
    const electricCooking = EMISSION_FACTORS.cookingFuel.electric * 365;
    expect(result.energyEmissions).toBe(Math.round(billElectricity + electricCooking));
  });

  it('keeps LPG as one cylinder per month * 12 * 35 kg CO2', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        electricityValue: 0,
        cookingFuel: 'lpg',
        acUsage: 'no',
        acHours: 0,
        heaterUsage: 0,
        electronicDevices: 0,
        distanceTravelled: 0,
        flightsPerYear: 0,
      })
    );

    expect(result.energyEmissions).toBe(Math.round(12 * EMISSION_FACTORS.cookingFuel.lpg));
  });
});

describe('stored draft merge protection', () => {
  it('merges old stored inputs with current defaults without reusing another draft object', () => {
    const userAInputs = mergeCalculatorInputs({
      primaryTransport: 'car',
      distanceTravelled: 50,
      fuelType: 'petrol',
      flightsPerYear: 5,
    });
    const userBInputs = mergeCalculatorInputs(null);

    expect(userAInputs.distanceTravelled).toBe(50);
    expect(userAInputs.flightsPerYear).toBe(5);
    expect(userBInputs).toEqual(initialInputs);
    expect(userBInputs).not.toEqual(userAInputs);
  });

  it('preserves zero flights when stored draft data is merged', () => {
    const restored = mergeCalculatorInputs({ flightsPerYear: 0 });
    expect(restored.flightsPerYear).toBe(0);
  });
});

describe('hidden field protection', () => {
  it('ignores stale car fuel after switching to cycle', () => {
    const result = calculateCarbonFootprint(
      withInputs({ primaryTransport: 'cycle', fuelType: 'petrol', distanceTravelled: 50, flightsPerYear: 0 })
    );
    expect(result.transportEmissions).toBe(0);
  });

  it('ignores stale car fuel after switching to walk', () => {
    const result = calculateCarbonFootprint(
      withInputs({ primaryTransport: 'walk', fuelType: 'diesel', distanceTravelled: 50, flightsPerYear: 0 })
    );
    expect(result.transportEmissions).toBe(0);
  });

  it('uses train factor only after switching from bike to train', () => {
    const result = calculateCarbonFootprint(
      withInputs({ primaryTransport: 'train', fuelType: 'petrol', distanceTravelled: 50, flightsPerYear: 0 })
    );
    expect(result.transportEmissions).toBe(Math.round(50 * 365 * EMISSION_FACTORS.transport.train));
  });

  it('uses bus factor only after switching from auto to bus', () => {
    const result = calculateCarbonFootprint(
      withInputs({ primaryTransport: 'bus', fuelType: 'cng', distanceTravelled: 50, flightsPerYear: 0 })
    );
    expect(result.transportEmissions).toBe(Math.round(50 * 365 * EMISSION_FACTORS.transport.bus));
  });

  it('removes flight emissions when flights change from 5 to 0', () => {
    const fiveFlights = calculateCarbonFootprint(withInputs({ distanceTravelled: 0, flightsPerYear: 5 }));
    const zeroFlights = calculateCarbonFootprint(withInputs({ distanceTravelled: 0, flightsPerYear: 0 }));

    expect(fiveFlights.transportEmissions - zeroFlights.transportEmissions).toBe(
      5 * EMISSION_FACTORS.flight
    );
    expect(zeroFlights.transportEmissions).toBe(0);
  });
});
describe('sanitizeNumber', () => {
  it('returns 0 for NaN and Infinity', () => {
    expect(sanitizeNumber(NaN)).toBe(0);
    expect(sanitizeNumber(Infinity)).toBe(0);
    expect(sanitizeNumber(-Infinity)).toBe(0);
  });

  it('clamps negatives to 0', () => {
    expect(sanitizeNumber(-5)).toBe(0);
  });

  it('preserves valid decimals', () => {
    expect(sanitizeNumber(2.5)).toBe(2.5);
  });
});

describe('transportRequiresFuel', () => {
  it('returns true only for car, bike, and auto', () => {
    expect(transportRequiresFuel('car')).toBe(true);
    expect(transportRequiresFuel('bike')).toBe(true);
    expect(transportRequiresFuel('auto')).toBe(true);
    expect(transportRequiresFuel('walk')).toBe(false);
    expect(transportRequiresFuel('cycle')).toBe(false);
    expect(transportRequiresFuel('bus')).toBe(false);
    expect(transportRequiresFuel('train')).toBe(false);
  });
});

describe('calculateCarbonFootprint', () => {
  it('returns near-zero transport for walk with zero distance and zero flights', () => {
    const result = calculateCarbonFootprint(
      withInputs({ primaryTransport: 'walk', distanceTravelled: 0, flightsPerYear: 0 })
    );
    expect(result.transportEmissions).toBe(0);
  });

  it('supports zero flights without forcing default flight emissions', () => {
    const zeroFlights = calculateCarbonFootprint(withInputs({ flightsPerYear: 0, distanceTravelled: 0 }));
    const oneFlight = calculateCarbonFootprint(withInputs({ flightsPerYear: 1, distanceTravelled: 0 }));
    expect(oneFlight.transportEmissions - zeroFlights.transportEmissions).toBe(
      EMISSION_FACTORS.flight
    );
  });

  it('annualizes daily commute distance correctly', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        primaryTransport: 'bus',
        distanceTravelled: 10,
        flightsPerYear: 0,
      })
    );
    const expected = Math.round(10 * 365 * EMISSION_FACTORS.transport.bus);
    expect(result.transportEmissions).toBe(expected);
  });

  it('ignores fuel type for cycle even when petrol is stored in state', () => {
    const cycleResult = calculateCarbonFootprint(
      withInputs({
        primaryTransport: 'cycle',
        distanceTravelled: 5,
        fuelType: 'petrol',
        flightsPerYear: 0,
      })
    );
    expect(cycleResult.transportEmissions).toBe(0);
  });

  it('applies fuel factor for car', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        primaryTransport: 'car',
        fuelType: 'petrol',
        distanceTravelled: 10,
        flightsPerYear: 0,
      })
    );
    const expected = Math.round(10 * 365 * EMISSION_FACTORS.transport.car.petrol);
    expect(result.transportEmissions).toBe(expected);
  });

  it('annualizes monthly electricity units (kWh/month × 12)', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        electricityType: 'units',
        electricityValue: 100,
        cookingFuel: 'electric',
        acUsage: 'no',
        acHours: 0,
        heaterUsage: 0,
        electronicDevices: 0,
        distanceTravelled: 0,
        flightsPerYear: 0,
        dailyWaste: 'low',
        clothesFrequency: 'rarely',
        wasteSegregation: 'no',
        recycling: 'no',
        composting: 'no',
      })
    );
    const electricity = 100 * 12 * EMISSION_FACTORS.electricity.perUnit;
    const cooking = EMISSION_FACTORS.cookingFuel.electric * 365;
    expect(result.energyEmissions).toBe(Math.round(electricity + cooking));
  });

  it('handles all-zero inputs without NaN or Infinity', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        distanceTravelled: 0,
        flightsPerYear: 0,
        electricityValue: 0,
        acHours: 0,
        heaterUsage: 0,
        electronicDevices: 0,
      })
    );
    expect(Number.isFinite(result.totalEmissions)).toBe(true);
    expect(Number.isFinite(result.annualEstimate)).toBe(true);
    expect(result.totalEmissions).toBeGreaterThan(0); // food + waste baselines remain
  });

  it('handles negative inputs by clamping to zero', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        distanceTravelled: -100,
        flightsPerYear: -5,
        electricityValue: -50,
      })
    );
    expect(result.transportEmissions).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.totalEmissions)).toBe(true);
  });

  it('handles large extreme values as finite numbers', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        primaryTransport: 'car',
        distanceTravelled: 1000,
        flightsPerYear: 100,
        electricityValue: 10000,
      })
    );
    expect(Number.isFinite(result.totalEmissions)).toBe(true);
    expect(result.transportEmissions).toBeGreaterThan(0);
  });

  it('handles decimal distance and preserves precision through rounding', () => {
    const result = calculateCarbonFootprint(
      withInputs({
        primaryTransport: 'train',
        distanceTravelled: 2.5,
        flightsPerYear: 0,
      })
    );
    const expected = Math.round(2.5 * 365 * EMISSION_FACTORS.transport.train);
    expect(result.transportEmissions).toBe(expected);
  });

  it('produces lower transport emissions for cyclist vs daily car user', () => {
    const cyclist = calculateCarbonFootprint(
      withInputs({ primaryTransport: 'cycle', distanceTravelled: 10, flightsPerYear: 0 })
    );
    const driver = calculateCarbonFootprint(
      withInputs({
        primaryTransport: 'car',
        fuelType: 'petrol',
        distanceTravelled: 30,
        flightsPerYear: 0,
      })
    );
    expect(cyclist.transportEmissions).toBeLessThan(driver.transportEmissions);
  });

  it('produces lower food emissions for vegan vs non-vegetarian daily meat', () => {
    const vegan = calculateCarbonFootprint(withInputs({ diet: 'vegan' }));
    const heavyMeat = calculateCarbonFootprint(
      withInputs({
        diet: 'non-vegetarian',
        meatFrequency: 'daily',
        beefMuttonFrequency: 'daily',
      })
    );
    expect(vegan.foodEmissions).toBeLessThan(heavyMeat.foodEmissions);
  });
});

describe('scenario validation matrix', () => {
  const scenarios: Array<{ name: string; overrides: Partial<CalculatorInputs> }> = [
    { name: 'walking student with no flights', overrides: { primaryTransport: 'walk', distanceTravelled: 2, flightsPerYear: 0, electricityValue: 40, electronicDevices: 2 } },
    { name: 'cyclist with default household profile', overrides: { primaryTransport: 'cycle', distanceTravelled: 8, flightsPerYear: 0 } },
    { name: 'bus commuter', overrides: { primaryTransport: 'bus', distanceTravelled: 18, flightsPerYear: 0 } },
    { name: 'train commuter', overrides: { primaryTransport: 'train', distanceTravelled: 35, flightsPerYear: 0 } },
    { name: 'petrol bike commuter', overrides: { primaryTransport: 'bike', fuelType: 'petrol', distanceTravelled: 22, flightsPerYear: 0 } },
    { name: 'electric bike commuter', overrides: { primaryTransport: 'bike', fuelType: 'electric', distanceTravelled: 22, flightsPerYear: 0 } },
    { name: 'daily petrol car user', overrides: { primaryTransport: 'car', fuelType: 'petrol', distanceTravelled: 45, flightsPerYear: 0 } },
    { name: 'daily CNG car user', overrides: { primaryTransport: 'car', fuelType: 'cng', distanceTravelled: 45, flightsPerYear: 0 } },
    { name: 'auto rickshaw CNG commuter', overrides: { primaryTransport: 'auto', fuelType: 'cng', distanceTravelled: 16, flightsPerYear: 0 } },
    { name: 'no flights explicit zero', overrides: { flightsPerYear: 0, distanceTravelled: 0 } },
    { name: 'frequent flyer', overrides: { flightsPerYear: 24, distanceTravelled: 5 } },
    { name: 'vegetarian household', overrides: { diet: 'vegetarian', meatFrequency: 'never', beefMuttonFrequency: 'never' } },
    { name: 'heavy non vegetarian household', overrides: { diet: 'non-vegetarian', meatFrequency: 'daily', beefMuttonFrequency: 'daily' } },
    { name: 'vegan low waste household', overrides: { diet: 'vegan', foodWaste: 'low', localFood: 'always', dailyWaste: 'low', clothesFrequency: 'rarely', wasteSegregation: 'yes', recycling: 'yes', composting: 'yes' } },
    { name: 'high electricity household', overrides: { electricityType: 'units', electricityValue: 10000, acUsage: 'yes', acHours: 12, heaterUsage: 3, electronicDevices: 25 } },
    { name: 'low electricity household', overrides: { electricityType: 'units', electricityValue: 25, acUsage: 'no', acHours: 0, heaterUsage: 0, electronicDevices: 1 } },
    { name: 'large distance and flights', overrides: { primaryTransport: 'car', fuelType: 'diesel', distanceTravelled: 1000, flightsPerYear: 100, electricityValue: 10000 } },
    { name: 'decimal commute and appliance use', overrides: { primaryTransport: 'train', distanceTravelled: 2.5, acUsage: 'yes', acHours: 1.5, heaterUsage: 0.5, electricityValue: 123.5 } },
    { name: 'negative numeric inputs are clamped', overrides: { distanceTravelled: -10, flightsPerYear: -1, electricityValue: -100, acHours: -2, heaterUsage: -1, electronicDevices: -5 } },
    { name: 'empty numeric fields parsed as zero equivalent', overrides: { distanceTravelled: Number.NaN, flightsPerYear: Number.NaN, electricityValue: Number.NaN, acHours: Number.NaN, heaterUsage: Number.NaN, electronicDevices: Number.NaN } },
    { name: 'stale petrol fuel ignored for walking', overrides: { primaryTransport: 'walk', fuelType: 'petrol', distanceTravelled: 25, flightsPerYear: 0 } },
    { name: 'stale diesel fuel ignored for train', overrides: { primaryTransport: 'train', fuelType: 'diesel', distanceTravelled: 25, flightsPerYear: 0 } },
  ];

  it.each(scenarios)('$name returns finite non-negative category results', ({ overrides }) => {
    const result = calculateCarbonFootprint(withInputs(overrides));

    expect(Number.isFinite(result.transportEmissions)).toBe(true);
    expect(Number.isFinite(result.energyEmissions)).toBe(true);
    expect(Number.isFinite(result.foodEmissions)).toBe(true);
    expect(Number.isFinite(result.wasteEmissions)).toBe(true);
    expect(Number.isFinite(result.totalEmissions)).toBe(true);
    expect(Number.isFinite(result.annualEstimate)).toBe(true);

    expect(result.transportEmissions).toBeGreaterThanOrEqual(0);
    expect(result.energyEmissions).toBeGreaterThanOrEqual(0);
    expect(result.foodEmissions).toBeGreaterThanOrEqual(0);
    expect(result.wasteEmissions).toBeGreaterThanOrEqual(0);
    const roundedCategorySum =
      result.transportEmissions + result.energyEmissions + result.foodEmissions + result.wasteEmissions;
    expect(Math.abs(result.totalEmissions - roundedCategorySum)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.annualEstimate - result.totalEmissions / 1000)).toBeLessThanOrEqual(0.01);
    expect(result.ecoScore).toBeGreaterThanOrEqual(1);
    expect(result.ecoScore).toBeLessThanOrEqual(100);
  });
});
