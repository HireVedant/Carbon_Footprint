/**
 * EcoTrack AI — Calculation Engine v2.2 (Thin Wrapper)
 *
 * Delegates to src/core/calculation/ for all scientific calculations.
 * This file exists for backward compatibility — all imports from this path
 * will continue to work.
 *
 * @module utils/calculationEngine
 * @deprecated Use `src/core/calculation` instead for new code.
 */

// Re-export all types for backward compatibility
export type {
  FlightTripInput,
  ApplianceUsageInput,
  AssessmentAnswers,
  CalculationResult,
  SectorBreakdown,
  SubBreakdown,
  CalculationMetadata,
} from '../types/assessment';

// Re-export the confidence breakdown type (legacy path)
export type { AssessmentConfidenceBreakdown } from '../types/assessment';

// Import the core engine
import { calculateEmissions as coreCalculateEmissions } from '../core/calculation/emissions';
import type { AssessmentAnswers } from '../types/assessment';

/**
 * Calculate emissions — delegates to core engine.
 *
 * @deprecated Use `calculateEmissions` from `src/core/calculation` instead.
 */
export function calculateEmissions(answers: AssessmentAnswers) {
  return coreCalculateEmissions(answers);
}