/**
 * Indian Solid Waste & Recycling Emission Datasets
 * Source: CPCB (Central Pollution Control Board) & Swachh Bharat Urban Benchmark
 * Units: kg CO2e / kg waste or kg CO2e / person / year
 */

export interface WasteStreamEntry {
  id: string;
  name: string;
  baselineKgCO2PerKg: number;
  recyclingCreditKgCO2PerKg: number; // Negative value (avoided emissions)
  compostingCreditKgCO2PerKg: number;
}

export interface WasteDataset {
  datasetVersion: string;
  source: string;
  publicationDate: string;
  updateDate: string;
  urbanPerCapitaDailyKgWaste: number; // ~0.45 kg/day in urban India
  ruralPerCapitaDailyKgWaste: number; // ~0.25 kg/day in rural India
  landfillMethaneFactorKgCO2PerKg: number;
  wasteStreams: Record<string, WasteStreamEntry>;
}

export const wasteDataset: WasteDataset = {
  datasetVersion: 'CPCB-SWACHH-2026.1',
  source: 'Central Pollution Control Board (CPCB) & Ministry of Housing and Urban Affairs',
  publicationDate: '2024-07-15',
  updateDate: '2026-01-10',
  urbanPerCapitaDailyKgWaste: 0.48,
  ruralPerCapitaDailyKgWaste: 0.26,
  landfillMethaneFactorKgCO2PerKg: 0.72,
  wasteStreams: {
    'organic_food': {
      id: 'organic_food',
      name: 'Organic Kitchen & Wet Waste',
      baselineKgCO2PerKg: 0.65, // Methane generation in unmanaged landfill
      recyclingCreditKgCO2PerKg: 0.0,
      compostingCreditKgCO2PerKg: -0.45 // Avoided landfill methane via wet composting
    },
    'plastic': {
      id: 'plastic',
      name: 'Dry Plastic Waste',
      baselineKgCO2PerKg: 1.85,
      recyclingCreditKgCO2PerKg: -1.25,
      compostingCreditKgCO2PerKg: 0.0
    },
    'paper_cardboard': {
      id: 'paper_cardboard',
      name: 'Paper & Cardboard',
      baselineKgCO2PerKg: 0.92,
      recyclingCreditKgCO2PerKg: -0.75,
      compostingCreditKgCO2PerKg: -0.30
    },
    'ewaste': {
      id: 'ewaste',
      name: 'Electronic Waste (E-Waste)',
      baselineKgCO2PerKg: 4.50,
      recyclingCreditKgCO2PerKg: -3.20,
      compostingCreditKgCO2PerKg: 0.0
    }
  }
};

// ─── Dataset Registry Self-Registration ──────────────────────────────────────
import { registry } from '../registry/DatasetRegistry';
registry.register({
  id: 'waste_streams',
  displayName: 'CPCB Solid Waste & Recycling Emission Factors',
  version: wasteDataset.datasetVersion,
  source: wasteDataset.source,
  publicationDate: wasteDataset.publicationDate,
  updateDate: wasteDataset.updateDate,
  units: 'kg CO2e / kg waste',
  category: 'WASTE',
  status: 'active',
  description: 'Per-capita solid waste generation and stream-specific emission factors for Indian urban and rural contexts.',
  license: 'Public Domain (Government of India Open Data)',
  data: wasteDataset,
});
