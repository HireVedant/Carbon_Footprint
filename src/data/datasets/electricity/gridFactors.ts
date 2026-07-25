/**
 * Central Electricity Authority (CEA) India CO2 Baseline Emission Factors
 * Source: CEA User Guide Version 19.0 / MoEFCC Guidelines
 * Units: kg CO2e / kWh
 */

export interface GridFactorEntry {
  stateOrUT: string;
  gridRegion: 'NORTH' | 'WEST' | 'SOUTH' | 'EAST' | 'NORTHEAST' | 'ISLANDS';
  factorKgCO2PerKWh: number;
}

export interface ElectricityDataset {
  datasetVersion: string;
  source: string;
  publicationDate: string;
  updateDate: string;
  units: string;
  assumptions: string[];
  nationalAverageKgCO2PerKWh: number;
  factors: Record<string, GridFactorEntry>;
}

export const electricityGridDataset: ElectricityDataset = {
  datasetVersion: 'CEA-2026.1',
  source: 'Central Electricity Authority (CEA), Ministry of Power, Govt of India',
  publicationDate: '2024-12-01',
  updateDate: '2026-01-15',
  units: 'kg CO2e / kWh',
  assumptions: [
    'Includes weighted average grid generation mix (Coal, Gas, Hydro, Nuclear, Renewable)',
    'Includes average transmission and distribution (T&D) losses of 18%',
    'Islands (Andaman & Lakshadweep) utilize local diesel microgrid factors'
  ],
  nationalAverageKgCO2PerKWh: 0.716, // Weighted national grid baseline
  factors: {
    'Andhra Pradesh': { stateOrUT: 'Andhra Pradesh', gridRegion: 'SOUTH', factorKgCO2PerKWh: 0.712 },
    'Arunachal Pradesh': { stateOrUT: 'Arunachal Pradesh', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.350 },
    'Assam': { stateOrUT: 'Assam', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.540 },
    'Bihar': { stateOrUT: 'Bihar', gridRegion: 'EAST', factorKgCO2PerKWh: 0.810 },
    'Chhattisgarh': { stateOrUT: 'Chhattisgarh', gridRegion: 'WEST', factorKgCO2PerKWh: 0.860 },
    'Goa': { stateOrUT: 'Goa', gridRegion: 'WEST', factorKgCO2PerKWh: 0.690 },
    'Gujarat': { stateOrUT: 'Gujarat', gridRegion: 'WEST', factorKgCO2PerKWh: 0.740 },
    'Haryana': { stateOrUT: 'Haryana', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.760 },
    'Himachal Pradesh': { stateOrUT: 'Himachal Pradesh', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.120 }, // High Hydro
    'Jharkhand': { stateOrUT: 'Jharkhand', gridRegion: 'EAST', factorKgCO2PerKWh: 0.840 },
    'Karnataka': { stateOrUT: 'Karnataka', gridRegion: 'SOUTH', factorKgCO2PerKWh: 0.580 }, // High Solar/Wind mix
    'Kerala': { stateOrUT: 'Kerala', gridRegion: 'SOUTH', factorKgCO2PerKWh: 0.320 }, // High Hydro mix
    'Madhya Pradesh': { stateOrUT: 'Madhya Pradesh', gridRegion: 'WEST', factorKgCO2PerKWh: 0.780 },
    'Maharashtra': { stateOrUT: 'Maharashtra', gridRegion: 'WEST', factorKgCO2PerKWh: 0.730 },
    'Manipur': { stateOrUT: 'Manipur', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.380 },
    'Meghalaya': { stateOrUT: 'Meghalaya', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.280 },
    'Mizoram': { stateOrUT: 'Mizoram', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.290 },
    'Nagaland': { stateOrUT: 'Nagaland', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.340 },
    'Odisha': { stateOrUT: 'Odisha', gridRegion: 'EAST', factorKgCO2PerKWh: 0.820 },
    'Punjab': { stateOrUT: 'Punjab', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.710 },
    'Rajasthan': { stateOrUT: 'Rajasthan', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.670 }, // High Solar expansion
    'Sikkim': { stateOrUT: 'Sikkim', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.080 }, // Hydro dominant
    'Tamil Nadu': { stateOrUT: 'Tamil Nadu', gridRegion: 'SOUTH', factorKgCO2PerKWh: 0.640 }, // High Wind/Solar
    'Telangana': { stateOrUT: 'Telangana', gridRegion: 'SOUTH', factorKgCO2PerKWh: 0.730 },
    'Tripura': { stateOrUT: 'Tripura', gridRegion: 'NORTHEAST', factorKgCO2PerKWh: 0.510 },
    'Uttar Pradesh': { stateOrUT: 'Uttar Pradesh', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.790 },
    'Uttarakhand': { stateOrUT: 'Uttarakhand', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.240 }, // High Hydro
    'West Bengal': { stateOrUT: 'West Bengal', gridRegion: 'EAST', factorKgCO2PerKWh: 0.770 },
    
    // Union Territories
    'Andaman and Nicobar Islands': { stateOrUT: 'Andaman and Nicobar Islands', gridRegion: 'ISLANDS', factorKgCO2PerKWh: 0.880 }, // Diesel Microgrid
    'Chandigarh': { stateOrUT: 'Chandigarh', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.680 },
    'Dadra and Nagar Haveli and Daman and Diu': { stateOrUT: 'Dadra and Nagar Haveli and Daman and Diu', gridRegion: 'WEST', factorKgCO2PerKWh: 0.720 },
    'Delhi': { stateOrUT: 'Delhi', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.710 },
    'Jammu and Kashmir': { stateOrUT: 'Jammu and Kashmir', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.260 },
    'Ladakh': { stateOrUT: 'Ladakh', gridRegion: 'NORTH', factorKgCO2PerKWh: 0.450 },
    'Lakshadweep': { stateOrUT: 'Lakshadweep', gridRegion: 'ISLANDS', factorKgCO2PerKWh: 0.890 }, // Diesel Microgrid
    'Puducherry': { stateOrUT: 'Puducherry', gridRegion: 'SOUTH', factorKgCO2PerKWh: 0.650 }
  }
};

// ─── Dataset Registry Self-Registration ──────────────────────────────────────
import { registry } from '../registry/DatasetRegistry';
registry.register({
  id: 'electricity_grid',
  displayName: 'CEA State Grid Emission Factors',
  version: electricityGridDataset.datasetVersion,
  source: electricityGridDataset.source,
  publicationDate: electricityGridDataset.publicationDate,
  updateDate: electricityGridDataset.updateDate,
  units: electricityGridDataset.units,
  category: 'ELECTRICITY',
  status: 'active',
  description: 'State-wise and UT-wise CO₂ emission factors for grid electricity consumption in India.',
  assumptions: electricityGridDataset.assumptions,
  license: 'Public Domain (Government of India Open Data)',
  data: electricityGridDataset,
});
