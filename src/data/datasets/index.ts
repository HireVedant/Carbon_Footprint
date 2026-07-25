/**
 * Central Scientific Datasets Registry — EcoTrack AI
 */

import { electricityGridDataset } from './electricity/gridFactors';
import { vehicleDataset } from './transport/vehicles';
import { aviationDataset } from './transport/airports';
import { transitDataset } from './transport/publicTransport';
import { fuelDataset } from './energy/fuels';
import { applianceDataset } from './energy/appliances';
import { foodDataset } from './food/dietaryFactors';
import { wasteDataset } from './waste/wasteFactors';
import { shoppingDataset } from './shopping/consumerFactors';
import { INDIAN_STATES_AND_UTS, HOUSING_TYPES } from './locations/locations';

export * from './electricity/gridFactors';
export * from './transport/vehicles';
export * from './transport/airports';
export * from './transport/publicTransport';
export * from './energy/fuels';
export * from './energy/appliances';
export * from './food/dietaryFactors';
export * from './waste/wasteFactors';
export * from './shopping/consumerFactors';
export * from './locations/locations';

// Registry layer — exports DatasetRegistry singleton and types
export * from './registry';

export interface DatasetRegistryMeta {
  version: string;
  lastUpdated: string;
  country: string;
  totalSubDatasets: number;
}

export const masterDatasetMetadata: DatasetRegistryMeta = {
  version: 'INDIA-SCIENCE-2026.1',
  lastUpdated: '2026-01-15',
  country: 'India',
  totalSubDatasets: 9
};

export const datasets = {
  meta: masterDatasetMetadata,
  electricity: electricityGridDataset,
  vehicles: vehicleDataset,
  aviation: aviationDataset,
  transit: transitDataset,
  fuels: fuelDataset,
  appliances: applianceDataset,
  food: foodDataset,
  waste: wasteDataset,
  shopping: shoppingDataset,
  locations: INDIAN_STATES_AND_UTS,
  housingTypes: HOUSING_TYPES
};
