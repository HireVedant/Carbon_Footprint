// ─────────────────────────────────────────────────────────────────────────────
// SEI Historical Survey Dataset
// Source: EcoTrack AI — Software Engineering Mini Project (FY-SEI Report)
// Survey conducted with 50+ participants
// ─────────────────────────────────────────────────────────────────────────────
import type { SEIDataset } from '../types/community';

export const SEI_DATASET: SEIDataset = {
  // ── Survey Statistics ───────────────────────────────────────────────────────
  surveyStats: {
    totalParticipants: 50,
    petrolUsers: 68,
    dailyCommute: 72,
    electricity150to250: 58,
    acUsage4hrs: 45,
    nonVegetarian: 62,
    foodWaste: 54,
    noWasteSegregation: 78,
    noComposting: 89,
    lowCarbonAwareness: 76,
    willingToUseEcoTrack: 83,
  },

  // ── Emission Distribution (%) ────────────────────────────────────────────────
  emissionDistribution: {
    transport: 48,
    energy: 31,
    food: 15,
    waste: 6,
  },

  // ── 10 Detailed Case Studies ────────────────────────────────────────────────
  caseStudies: [
    {
      id: 1,
      profile: 'Engineering Student',
      annualCO2: 2.64,
      ecoScore: 48,
      ecoLabel: 'Average Emitter',
      primaryCategory: 'Transport',
    },
    {
      id: 2,
      profile: 'Software Engineer',
      annualCO2: 6.65,
      ecoScore: 22,
      ecoLabel: 'High Impact',
      primaryCategory: 'Energy',
    },
    {
      id: 3,
      profile: 'Vegetarian Student',
      annualCO2: 1.13,
      ecoScore: 74,
      ecoLabel: 'Green Citizen',
      primaryCategory: 'Transport',
    },
    {
      id: 4,
      profile: 'Auto Driver',
      annualCO2: 2.43,
      ecoScore: 42,
      ecoLabel: 'Average Emitter',
      primaryCategory: 'Transport',
    },
    {
      id: 5,
      profile: 'Hostel Student Group',
      annualCO2: 3.11,
      ecoScore: 38,
      ecoLabel: 'High Impact',
      primaryCategory: 'Energy',
    },
    {
      id: 6,
      profile: 'Homemaker',
      annualCO2: 4.26,
      ecoScore: 28,
      ecoLabel: 'High Impact',
      primaryCategory: 'Energy',
    },
    {
      id: 7,
      profile: 'EV Student',
      annualCO2: 0.696,
      ecoScore: 92,
      ecoLabel: 'Eco Warrior',
      primaryCategory: 'Food',
    },
    {
      id: 8,
      profile: 'Teacher',
      annualCO2: 4.87,
      ecoScore: 18,
      ecoLabel: 'High Impact',
      primaryCategory: 'Transport',
    },
    {
      id: 9,
      profile: 'Vegan Student',
      annualCO2: 0.336,
      ecoScore: 98,
      ecoLabel: 'Eco Warrior',
      primaryCategory: 'Food',
    },
    {
      id: 10,
      profile: 'Joint Family',
      annualCO2: 8.91,
      ecoScore: 8,
      ecoLabel: 'Carbon Heavy',
      primaryCategory: 'Energy',
    },
  ],

  // ── Derived Metrics ─────────────────────────────────────────────────────────
  derivedMetrics: {
    totalAnnualCO2: 35.032,
    averageAnnualCO2: 3.503,
    averageEcoScore: 46.8,
    highestEcoScore: 98,
    lowestEcoScore: 8,
    bestPerformer: 'Vegan Student',
    highestEmitter: 'Joint Family',
  },
};
