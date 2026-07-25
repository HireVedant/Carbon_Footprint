/**
 * Indian Dietary Emission Datasets
 * Source: ICAR (Indian Council of Agricultural Research) & EAT-Lancet Commission India Focus
 * Units: kg CO2e / person / year
 */

export interface DietProfile {
  id: string;
  name: string;
  category: 'VEGETARIAN' | 'EGGETARIAN' | 'PESCATARIAN' | 'CHICKEN_LIGHT' | 'MIXED' | 'OTHER';
  baseAnnualKgCO2: number;
  description: string;
}

export interface FoodDataset {
  datasetVersion: string;
  source: string;
  publicationDate: string;
  updateDate: string;
  assumptions: string[];
  dietProfiles: Record<string, DietProfile>;
  foodWasteMultipliers: {
    LOW: number;     // < 5% wasted
    MODERATE: number; // 5-15% wasted
    HIGH: number;    // > 15% wasted
  };
  diningOutAddonKgCO2PerMeal: number;
}

export const foodDataset: FoodDataset = {
  datasetVersion: 'ICAR-EAT-2026.2',
  source: 'Indian Council of Agricultural Research & EAT-Lancet India Diet Benchmark',
  publicationDate: '2024-08-20',
  updateDate: '2026-02-01',
  assumptions: [
    'Pure vegetarian diet includes Indian dairy consumption (Milk, Curd, Paneer, Ghee)',
    'Eggetarian diet includes eggs in addition to lacto-vegetarian diet',
    'Mixed non-vegetarian diet reflects typical Indian urban non-vegetarian consumption'
  ],
  dietProfiles: {
    'vegan': {
      id: 'vegan',
      name: 'Plant-Based Vegan',
      category: 'VEGETARIAN',
      baseAnnualKgCO2: 480.0,
      description: 'Zero meat, zero dairy, zero eggs'
    },
    'lacto_vegetarian': {
      id: 'lacto_vegetarian',
      name: 'Lacto-Vegetarian (Traditional Indian Veg)',
      category: 'VEGETARIAN',
      baseAnnualKgCO2: 680.0,
      description: 'Plant-based with daily dairy (milk, curd, paneer, ghee)'
    },
    'eggetarian': {
      id: 'eggetarian',
      name: 'Eggetarian',
      category: 'EGGETARIAN',
      baseAnnualKgCO2: 780.0,
      description: 'Vegetarian diet plus regular egg intake'
    },
    'pescatarian': {
      id: 'pescatarian',
      name: 'Pescatarian (Fish & Seafood)',
      category: 'PESCATARIAN',
      baseAnnualKgCO2: 950.0,
      description: 'Vegetarian/dairy diet plus fish/seafood'
    },
    'chicken_moderate': {
      id: 'chicken_moderate',
      name: 'Poultry / Chicken (1-2 times/week)',
      category: 'CHICKEN_LIGHT',
      baseAnnualKgCO2: 1120.0,
      description: 'Moderate poultry & egg intake with lacto-veg base'
    },
    'mixed_non_veg': {
      id: 'mixed_non_veg',
      name: 'Mixed Non-Vegetarian (3-5 times/week)',
      category: 'MIXED',
      baseAnnualKgCO2: 1580.0,
      description: 'Frequent chicken, fish, eggs, and mixed non-veg'
    },
    'other_diet': {
      id: 'other_diet',
      name: 'Other Dietary Pattern',
      category: 'OTHER',
      baseAnnualKgCO2: 1250.0,
      description: 'Other custom dietary pattern in India'
    }
  },
  foodWasteMultipliers: {
    LOW: 1.0,
    MODERATE: 1.12,
    HIGH: 1.28
  },
  diningOutAddonKgCO2PerMeal: 1.85
};

// ─── Dataset Registry Self-Registration ──────────────────────────────────────
import { registry } from '../registry/DatasetRegistry';
registry.register({
  id: 'food_dietary',
  displayName: 'ICAR/EAT-Lancet Indian Dietary Emission Profiles',
  version: foodDataset.datasetVersion,
  source: foodDataset.source,
  publicationDate: foodDataset.publicationDate,
  updateDate: foodDataset.updateDate,
  units: 'kg CO2e / person / year',
  category: 'FOOD',
  status: 'active',
  description: 'Annual carbon footprint benchmarks for Indian dietary patterns.',
  assumptions: foodDataset.assumptions,
  license: 'CC-BY-4.0 (EAT-Lancet Commission)',
  data: foodDataset,
});
