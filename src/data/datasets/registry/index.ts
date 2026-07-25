/**
 * Dataset Registry Barrel — EcoTrack AI
 *
 * Importing this module ensures all 9 scientific datasets are registered
 * with the DatasetRegistry singleton. Import this once at the app entry
 * point (datasets/index.ts) and use the registry anywhere.
 */

// Export the registry and all its types
export {
  DatasetRegistry,
  registry,
  validateDatasetObject,
} from './DatasetRegistry';

export type {
  RegisteredDataset,
  DatasetStatus,
} from './DatasetRegistry';
