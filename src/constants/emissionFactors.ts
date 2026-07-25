export const EMISSION_FACTORS = {
  // Transportation (kg CO2 per km)
  transport: {
    walk: 0,
    cycle: 0,
    bus: 0.089,
    train: 0.041,
    bike: {
      petrol: 0.11,
      diesel: 0.11, // fallback
      cng: 0.07,
      electric: 0.03,
    },
    car: {
      petrol: 0.21,
      diesel: 0.22,
      cng: 0.14,
      electric: 0.05,
    },
    auto: {
      petrol: 0.15,
      diesel: 0.16,
      cng: 0.10,
      electric: 0.04,
    },
  },
  
  // Flights (kg CO2 per flight - approximate average short/medium haul)
  flight: 500, // per flight per year (annual contribution: flights * 500 kg CO2 / 365 days or annual total direct)

  // Energy
  electricity: {
    perUnit: 0.82, // kg CO2 per kWh (unit)
    perRupee: 0.12, // kg CO2 per rupee (approximate conversion if bill is provided: e.g. 7 Rs per unit)
  },
  
  cookingFuel: {
    lpg: 35, // kg CO2 per cylinder (assume ~1 cylinder per month average consumption per household)
    png: 1.9, // kg CO2 per cubic meter (standard PNG emission factor)
    electric: 0.4, // kg CO2 per day equivalent
    biomass: 5.0, // kg CO2 per kg or daily equivalent
  },

  // Appliance usage (approximate kW rating * grid emission factor)
  appliances: {
    acPerHour: 1.5 * 0.82, // ~1.5 kW * 0.82 kg CO2/kWh = 1.23 kg CO2 per hour
    heaterPerHour: 2.0 * 0.82, // ~2.0 kW * 0.82 kg CO2/kWh = 1.64 kg CO2 per hour
    devicePerDay: 0.05, // kg CO2 per device per day
  },

  // Food (approximate daily kg CO2 footprint based on diet & frequencies)
  food: {
    diet: {
      vegan: 2.5, // kg CO2 per day
      vegetarian: 3.8, // kg CO2 per day
      'non-vegetarian': 5.5, // kg CO2 per day base
    },
    meatFrequencyMultiplier: {
      daily: 1.5,
      weekly: 1.2,
      occasionally: 1.0,
      never: 0.8,
    },
    highImpactMeatFrequencyMultiplier: {
      daily: 2.0,
      weekly: 1.5,
      occasionally: 1.1,
      never: 0.9,
    },
    foodWaste: {
      low: 0.2, // kg CO2 per day
      medium: 0.5,
      high: 1.2,
    },
    localFoodBonus: {
      always: -0.5, // kg CO2 reduction per day
      mostly: -0.3,
      rarely: 0,
      never: 0.2,
    },
  },

  // Waste (daily kg CO2 equivalent from landfill/refuse)
  waste: {
    dailyGeneration: {
      low: 0.5, // kg CO2/day
      medium: 1.2,
      high: 2.5,
    },
    segregationDiscount: -0.2, // 20% discount if segregating
    recyclingDiscount: -0.3, // 30% discount if recycling
    compostingDiscount: -0.2, // 20% discount if composting
    clothesPurchasing: {
      monthly: 3.5, // daily kg CO2 equivalent for manufacturing
      quarterly: 1.5,
      annually: 0.5,
      rarely: 0.1,
    },
  },
};
