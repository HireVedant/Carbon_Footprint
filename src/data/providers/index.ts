/**
 * EcoTrack AI — Data Provider Layer Index
 *
 * Central export for all data providers. Components import from here.
 * Switching data sources (mock → government API → Firestore → CSV)
 * requires ZERO component modifications — only this index and the
 * underlying providers change.
 *
 * @module data/providers
 */

export { EnvironmentalEquivalentProvider } from './EnvironmentalEquivalentProvider';
export { NationalDataProvider } from './NationalDataProvider';

// Re-export types for convenience
export type {
  DatasetMetadata,
  ProviderResponse,
  EnvironmentalEquivalent,
  EnvironmentalEquivalentsSet,
  NationalStatistics,
  StateStatistics,
  INationalDataProvider,
  IStateDataProvider,
  ICommunityDataProvider,
  IAssessmentDataProvider,
  IEnvironmentalEquivalentProvider,
  ChartDataPoint,
  ChartMetadata,
  ChartDatasetConfig,
} from '../../types/dataProviders';