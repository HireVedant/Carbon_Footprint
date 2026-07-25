/**
 * AI Sustainability Coach Service — EcoTrack AI (Phase 8)
 *
 * Architecture:
 *   Calculation Engine → Callable Function → Gemini API → Cache → Return
 *
 * Privacy Rule: No Name, Email, UID, Phone, or Address is ever sent to the AI.
 * Security: Gemini API is called server-side via Cloud Functions.
 */

import { CalculationResult } from '../utils/calculationEngine';
import { AiRecommendation } from '../types/rbac';
import { functions } from '../firebase/firebase';
import { httpsCallable } from 'firebase/functions';

/** Returns rule-based offline fallback recommendations when Gemini is unavailable. */
function buildFallbackRecommendations(result: CalculationResult): AiRecommendation[] {
  const { breakdown, percentages } = result;
  const sorted = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return sorted.map(([category, value], i) => ({
    id: `fallback_${i + 1}`,
    title: `Reduce ${category.charAt(0).toUpperCase() + category.slice(1)} Emissions`,
    description: `Your ${category} footprint is ${value.toLocaleString()} kg CO₂/year (${percentages[category as keyof typeof percentages]}% of total). Consider switching to lower-emission alternatives in this category to make the greatest impact.`,
    estimatedReductionKgCO2: Math.round(value * 0.20),
    difficulty: 'MEDIUM' as const,
    costImplication: 'LOW' as const,
    impactRank: i + 1,
    confidencePercent: 70,
    category: category as any,
  }));
}

/**
 * Main AI Coach entry point.
 * Checks cache first, then calls the secure Firebase Callable Function.
 * Falls back gracefully on API failures.
 */
export async function generateAiRecommendations(
  result: CalculationResult,
  assessmentId: string,
  cachedAdvice: AiRecommendation[] | undefined | null,
  stateHint: string = 'Delhi',
  dietHint: string = 'vegetarian',
  forceRefresh: boolean = false
): Promise<{ recommendations: AiRecommendation[]; fromCache: boolean; error?: string }> {

  // 1. Return cached advice if available and not forcing refresh
  if (!forceRefresh && cachedAdvice && cachedAdvice.length > 0) {
    return { recommendations: cachedAdvice, fromCache: true };
  }

  // 2. Call Cloud Function securely
  try {
    const getAdvice = httpsCallable(functions, 'generateAiAdvice');
    const response = await getAdvice({ result, assessmentId, stateHint, dietHint });
    const data = response.data as { recommendations: AiRecommendation[] };
    
    if (!data.recommendations || data.recommendations.length === 0) {
      throw new Error('No valid recommendations returned from server');
    }

    return { recommendations: data.recommendations, fromCache: false };
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown server error';
    return {
      recommendations: buildFallbackRecommendations(result),
      fromCache: false,
      error: `AI unavailable: ${errorMsg}. Showing rule-based recommendations.`
    };
  }
}
