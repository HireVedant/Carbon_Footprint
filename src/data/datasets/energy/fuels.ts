/**
 * Indian Cooking Fuel & Energy Source Emission Factors
 * Source: MoEFCC GHG Inventory Guidelines & Bureau of Energy Efficiency (BEE)
 */

export interface CookingFuelEntry {
  id: string;
  name: string;
  unit: string;
  emissionFactorKgCO2PerUnit: number;
  description: string;
}

export interface FuelDataset {
  datasetVersion: string;
  source: string;
  publicationDate: string;
  updateDate: string;
  fuels: Record<string, CookingFuelEntry>;
  solarOffsetKgCO2PerKWh: number;
}

export const fuelDataset: FuelDataset = {
  datasetVersion: 'BEE-MOEFCC-2026.1',
  source: 'Ministry of Environment, Forest & Climate Change (MoEFCC) & BEE Guidelines',
  publicationDate: '2024-10-12',
  updateDate: '2026-01-10',
  solarOffsetKgCO2PerKWh: 0.716, // Offsets national grid electricity
  fuels: {
    'lpg': {
      id: 'lpg',
      name: 'LPG Cylinder (14.2 kg domestic cylinder)',
      unit: 'cylinders/month',
      emissionFactorKgCO2PerUnit: 42.6, // 14.2 kg * 3.0 kg CO2/kg LPG
      description: 'Standard Indian domestic LPG cylinder'
    },
    'png': {
      id: 'png',
      name: 'Piped Natural Gas (PNG)',
      unit: 'SMC/month',
      emissionFactorKgCO2PerUnit: 2.05, // kg CO2 / Standard Cubic Meter
      description: 'Urban piped natural gas network'
    },
    'induction': {
      id: 'induction',
      name: 'Electric Induction Cooktop',
      unit: 'kWh/month',
      emissionFactorKgCO2PerUnit: 0.716, // Grid dependent factor
      description: 'Electricity powered cooking'
    },
    'biomass': {
      id: 'biomass',
      name: 'Biomass / Firewood / Cow Dung Cakes',
      unit: 'kg/month',
      emissionFactorKgCO2PerUnit: 1.83,
      description: 'Traditional rural cooking biomass'
    },
    'diesel_generator': {
      id: 'diesel_generator',
      name: 'Power Backup Diesel Generator (DG Set)',
      unit: 'liters/month',
      emissionFactorKgCO2PerUnit: 2.68,
      description: 'Residential power backup DG set'
    }
  }
};

// ─── Dataset Registry Self-Registration ──────────────────────────────────────
import { registry } from '../registry/DatasetRegistry';
registry.register({
  id: 'energy_fuels',
  displayName: 'MoEFCC/BEE Cooking & Energy Fuel Factors',
  version: fuelDataset.datasetVersion,
  source: fuelDataset.source,
  publicationDate: fuelDataset.publicationDate,
  updateDate: fuelDataset.updateDate,
  units: 'kg CO2e per unit (cylinder / SMC / kWh / kg)',
  category: 'ENERGY_FUELS',
  status: 'active',
  description: 'CO₂ emission factors for Indian household cooking and energy fuel types including LPG, PNG, induction, and biomass.',
  license: 'Public Domain (Government of India Open Data)',
  data: fuelDataset,
});
