/**
 * Eco Score Calculator
 * Computes a 0-100 eco score and letter grade based on annual CO2 emissions.
 * Uses Indian per-capita emission benchmarks.
 *
 * Sources:
 * - World Bank India per-capita CO2: ~1.9 tonnes/year (2023)
 * - MoEFCC national targets
 *
 * @module core/calculation/ecoScore
 */

import type { EcoScoreResult } from '../../types/assessment';

/**
 * India-specific per-capita CO2 benchmarks (tonnes/year).
 * Used to compute eco score percentiles.
 */
const BENCHMARKS = {
  /** Excellent: below 1.0 tonne (top ~10% of Indian population) */
  excellent: 1.0,
  /** Good: 1.0 - 1.5 tonnes (top ~25%) */
  good: 1.5,
  /** Average: 1.5 - 2.5 tonnes (Indian national average ~1.9t) */
  average: 2.5,
  /** Below average: 2.5 - 4.0 tonnes */
  belowAverage: 4.0,
  /** Poor: above 4.0 tonnes */
  poor: 4.0,
};

/**
 * Calculate eco score from annual CO2 emissions.
 *
 * @param annualTonnesCO2 - Annual CO2 emission in tonnes
 * @returns Eco score result with score, grade, label, and percentile
 */
export function calculateEcoScore(annualTonnesCO2: number): EcoScoreResult {
  // Clamp to non-negative
  const tonnes = Math.max(0, annualTonnesCO2);

  let score: number;
  if (tonnes <= BENCHMARKS.excellent) {
    // 90-100: Excellent
    score = Math.round(90 + (1 - tonnes / BENCHMARKS.excellent) * 10);
  } else if (tonnes <= BENCHMARKS.good) {
    // 75-89: Good
    const progress = (BENCHMARKS.excellent - tonnes) / (BENCHMARKS.excellent - BENCHMARKS.good);
    score = Math.round(75 + progress * 14);
  } else if (tonnes <= BENCHMARKS.average) {
    // 55-74: Average
    const progress = (BENCHMARKS.good - tonnes) / (BENCHMARKS.good - BENCHMARKS.average);
    score = Math.round(55 + progress * 19);
  } else if (tonnes <= BENCHMARKS.belowAverage) {
    // 30-54: Below average
    const progress = (BENCHMARKS.average - tonnes) / (BENCHMARKS.average - BENCHMARKS.belowAverage);
    score = Math.round(30 + progress * 24);
  } else {
    // 0-29: Poor
    score = Math.max(0, Math.round(30 * Math.exp(-(tonnes - BENCHMARKS.belowAverage) / 3)));
  }

  score = Math.max(0, Math.min(100, score));

  let grade: EcoScoreResult['grade'];
  let label: string;
  if (score >= 90) { grade = 'A+'; label = 'Outstanding'; }
  else if (score >= 80) { grade = 'A'; label = 'Excellent'; }
  else if (score >= 70) { grade = 'B+'; label = 'Very Good'; }
  else if (score >= 60) { grade = 'B'; label = 'Good'; }
  else if (score >= 50) { grade = 'C+'; label = 'Above Average'; }
  else if (score >= 40) { grade = 'C'; label = 'Average'; }
  else if (score >= 25) { grade = 'D'; label = 'Below Average'; }
  else { grade = 'F'; label = 'Needs Improvement'; }

  // Approximate percentile (lower emission = higher percentile)
  const percentile = Math.max(1, Math.min(99, Math.round(
    100 * Math.exp(-tonnes / 3.0)
  )));

  return { score, grade, label, percentile };
}