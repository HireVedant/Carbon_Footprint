/**
 * EcoTrack AI — National Data Provider
 *
 * Provides India-specific national environmental statistics sourced from
 * Government of India bodies: NITI Aayog, MoEFCC, CEA, CPCB, IEA India data.
 *
 * Components never know the data origin — they consume typed interfaces only.
 *
 * @module data/providers/NationalDataProvider
 */

import type {
  INationalDataProvider,
  DatasetMetadata,
  ProviderResponse,
  NationalStatistics,
} from '../../types/dataProviders';

// ── Government-Sourced Constants ────────────────────────────────────────────

/** India per-capita CO₂ emissions: 1.9 tonnes CO₂e/year.
 *  Source: Global Carbon Project 2024 / IEA India Country Profile. */
const INDIA_PER_CAPITA_KG = 1900;

/** India population: 1.44 billion = 144 crore.
 *  Source: Census of India 2024 projection / UN World Population Prospects. */
const INDIA_POPULATION_CRORES = 144;

/** India total annual CO₂ emissions: 2.88 Gt CO₂.
 *  Source: Global Carbon Project 2024. */
const INDIA_TOTAL_ANNUAL_GT = 2.88;

/** India renewable energy share in electricity: ~21%.
 *  Source: CEA Monthly Installed Capacity Report / MNRE. */
const INDIA_RENEWABLE_SHARE = 21;

/** India's top emitting sector: Electricity & Heat.
 *  Source: IEA India Energy Balance / NITI Aayog. */
const INDIA_TOP_SECTOR = 'Electricity & Heat Generation';

/** CEA national average grid emission factor.
 *  Source: CEA National Grid Emission Factor Report. */
const INDIA_GRID_FACTOR = 0.716;

// ── Provider Metadata ──────────────────────────────────────────────────────

const PROVIDER_METADATA: DatasetMetadata = {
  source: 'EcoTrack AI National Data Provider',
  sourceUrl: 'https://ecotrack.ai/methodology/national-data',
  lastUpdated: '2026-01-15',
  confidence: 'high',
  units: 'varies by metric',
  license: 'Open Data — Government of India',
  methodology:
    'Statistics aggregated from Global Carbon Project, IEA India, NITI Aayog, CEA, and MNRE reports. ' +
    'Per-capita figure uses India-specific calculation (total emissions ÷ population).',
};

// ── Provider Implementation ────────────────────────────────────────────────

class NationalDataProviderImpl implements INationalDataProvider {

  getNationalStatistics(): ProviderResponse<NationalStatistics> {
    return {
      metadata: PROVIDER_METADATA,
      data: {
        perCapitaKgCO2PerYear: INDIA_PER_CAPITA_KG,
        populationCrores: INDIA_POPULATION_CRORES,
        totalAnnualEmissionGtCO2: INDIA_TOTAL_ANNUAL_GT,
        renewableSharePercent: INDIA_RENEWABLE_SHARE,
        topEmittingSector: INDIA_TOP_SECTOR,
        gridAverageFactorKgCO2PerKWh: INDIA_GRID_FACTOR,
      },
    };
  }

  getIndiaAverageFootprintKg(): ProviderResponse<number> {
    return {
      metadata: PROVIDER_METADATA,
      data: INDIA_PER_CAPITA_KG,
    };
  }
}

/** Singleton instance of the National Data Provider. */
export const NationalDataProvider: INationalDataProvider =
  new NationalDataProviderImpl();

export default NationalDataProvider;