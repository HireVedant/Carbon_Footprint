/**
 * EcoTrack AI — Data Provider Type Definitions
 *
 * Central type definitions for the Data Provider Layer.
 * Every data source, whether mock, government dataset, Firestore, or CSV,
 * must conform to these interfaces.
 *
 * @module types/dataProviders
 */

// ─── Dataset Metadata ──────────────────────────────────────────────────────

/** Source attribution metadata for every dataset. */
export interface DatasetMetadata {
  /** Organization or body that published the dataset. */
  source: string;
  /** URL to the primary data source. */
  sourceUrl: string;
  /** ISO-8601 date string of last known update. */
  lastUpdated: string;
  /** Confidence level of the dataset values. */
  confidence: 'high' | 'medium' | 'estimated';
  /** Unit of measurement used throughout the dataset. */
  units: string;
  /** License under which the data is published (e.g. 'Open Government Licence India'). */
  license?: string;
  /** Brief description of the methodology used to derive values. */
  methodology?: string;
}

/** Generic provider response wrapping data with metadata. */
export interface ProviderResponse<T> {
  metadata: DatasetMetadata;
  data: T;
}

// ─── Environmental Equivalents ──────────────────────────────────────────────

/** A single environmental equivalence entry. */
export interface EnvironmentalEquivalent {
  /** Unique identifier. */
  id: string;
  /** Display label (Indian English). */
  label: string;
  /** Short value string (e.g. '12.5'). */
  value: string;
  /** Unit label (e.g. 'LPG cylinders'). */
  unit: string;
  /** Longer description for tooltip/detail. */
  description: string;
  /** Source attribution for this specific equivalent. */
  source: string;
  /** Icon name from lucide-react. */
  iconName: string;
  /** Theme color class. */
  colorClass: string;
  /** Formula used to calculate this equivalent. */
  formula: string;
}

/** All environmental equivalents for a given tonnage. */
export interface EnvironmentalEquivalentsSet {
  totalTonnesCO2: number;
  equivalents: EnvironmentalEquivalent[];
}

// ─── National Statistics ────────────────────────────────────────────────────

export interface NationalStatistics {
  perCapitaKgCO2PerYear: number;
  populationCrores: number;
  totalAnnualEmissionGtCO2: number;
  renewableSharePercent: number;
  topEmittingSector: string;
  gridAverageFactorKgCO2PerKWh: number;
}

export interface StateStatistics {
  state: string;
  gridFactorKgCO2PerKWh: number;
  populationLakhs: number;
  renewableCapacityMW: number;
  urbanisationPercent: number;
  gridRegion: string;
}

// ─── Data Provider Contracts ────────────────────────────────────────────────

/** Provider for national-level environmental statistics. */
export interface INationalDataProvider {
  getNationalStatistics(): ProviderResponse<NationalStatistics>;
  getIndiaAverageFootprintKg(): ProviderResponse<number>;
}

/** Provider for state-level data. */
export interface IStateDataProvider {
  getStateStatistics(state: string): ProviderResponse<StateStatistics>;
  getGridFactor(state: string): ProviderResponse<number>;
  getAllStates(): ProviderResponse<string[]>;
}

/** Provider for community aggregate data from Firestore. */
export interface ICommunityDataProvider {
  getCommunityAverages(): Promise<ProviderResponse<{
    averageFootprintKg: number;
    totalUsers: number;
    averageEcoScore: number;
    categoryBreakdown: {
      transport: number;
      energy: number;
      food: number;
      waste: number;
      shopping: number;
    };
  }>>;
}

/** Provider for assessment calculation input/output. */
export interface IAssessmentDataProvider {
  getEmissionFactors(): ProviderResponse<Record<string, number>>;
  getDefaultInputs(): ProviderResponse<Record<string, unknown>>;
}

/** Provider for environmental equivalents. */
export interface IEnvironmentalEquivalentProvider {
  /**
   * Given a CO₂ emission value in kg, compute all Indian environmental equivalents.
   */
  computeEquivalents(totalKgCO2PerYear: number): ProviderResponse<EnvironmentalEquivalentsSet>;
  /**
   * Return a single equivalent by ID.
   */
  getEquivalent(id: string, totalKgCO2PerYear: number): EnvironmentalEquivalent | null;
  /**
   * Return the source attribution for all equivalents.
   */
  getMetadata(): DatasetMetadata;
}

// ─── Chart Data Contracts ───────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  unit: string;
  source: string;
}

export interface ChartMetadata {
  title: string;
  subtitle: string;
  source: string;
  lastUpdated: string;
  units: string;
  questionAnswered: string;
}

export interface ChartDatasetConfig {
  data: ChartDataPoint[];
  metadata: ChartMetadata;
  tooltipFormatter: (value: number, unit: string) => string;
  accessibilityLabel: string;
}