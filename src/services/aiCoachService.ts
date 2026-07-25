/**
 * AI Sustainability Coach Service — EcoTrack AI (Phase 5)
 *
 * Architecture:
 *   Calculation Engine → Breakdown → [PII Stripper] → Gemini API → Cache → Return
 *
 * Privacy Rule: No Name, Email, UID, Phone, or Address is ever sent to the AI.
 */

import { CalculationResult } from '../utils/calculationEngine';
import { AiRecommendation } from '../types/rbac';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const MODEL_ID = 'gemini-1.5-flash';
const PROMPT_VERSION = '1.0.0';

/** Logs an AI call event to Firestore ai_logs collection (fire-and-forget). */
async function logAiCall(opts: {
  assessmentId: string;
  fromCache: boolean;
  latencyMs: number;
  success: boolean;
  error?: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, 'ai_logs'), {
      model: MODEL_ID,
      promptVersion: PROMPT_VERSION,
      assessmentId: opts.assessmentId,
      fromCache: opts.fromCache,
      latencyMs: opts.latencyMs,
      success: opts.success,
      error: opts.error || null,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Logging failures must never surface to the user
  }
}

/** Maximum Gemini calls per user per hour */
const RATE_LIMIT_MS = 60 * 60 * 1000;
const rateLimitMap = new Map<string, number>();

/** Checks whether a user has exceeded the per-hour Gemini request limit. */
function isRateLimited(cacheKey: string): boolean {
  const lastCall = rateLimitMap.get(cacheKey);
  if (!lastCall) return false;
  return Date.now() - lastCall < RATE_LIMIT_MS;
}

/**
 * Builds a fully anonymized, PII-free prompt for Gemini.
 * Never includes: Name, Email, Phone, UID, Address, or any personal identifier.
 */
function buildAnonymizedPrompt(result: CalculationResult, stateHint: string, dietHint: string): string {
  const { breakdown, percentages, totalKgCO2PerYear, totalTonnesCO2PerYear, metadata } = result;

  return `You are a scientific sustainability coach providing personalized, actionable recommendations to a user in India.

IMPORTANT: Do NOT generate generic advice. Each recommendation MUST reference specific numbers from the breakdown below.

USER PROFILE (anonymized — no personal identifiers):
- Location: ${stateHint}, India
- Annual Carbon Footprint: ${totalKgCO2PerYear.toLocaleString()} kg CO₂e (${totalTonnesCO2PerYear} tonnes)
- Electricity Grid Factor: ${metadata.gridFactorUsed} kg CO₂/kWh (${stateHint} CEA grid)
- Confidence Score: ${result.confidence?.overallScore ?? 85}% (${result.confidence?.overallRating ?? 'HIGH'})

EMISSION BREAKDOWN:
- Transport: ${breakdown.transport.toLocaleString()} kg CO₂ (${percentages.transport}% of total)
- Energy: ${breakdown.energy.toLocaleString()} kg CO₂ (${percentages.energy}% of total)
- Food: ${breakdown.food.toLocaleString()} kg CO₂ (${percentages.food}% of total)
- Waste: ${breakdown.waste.toLocaleString()} kg CO₂ (${percentages.waste}% of total)
- Shopping: ${breakdown.shopping.toLocaleString()} kg CO₂ (${percentages.shopping}% of total)
- Diet Pattern: ${dietHint}
- Calculator Version: ${metadata.calculatorVersion}

TASK: Generate exactly 5 ranked recommendations. For EACH recommendation provide:
1. A concise action title (max 10 words)
2. A detailed explanation that references the user's EXACT numbers above
3. Estimated annual CO₂ reduction in kg (be specific, not vague)
4. Difficulty: EASY, MEDIUM, or HARD
5. Cost implication: SAVINGS, LOW, MODERATE, or HIGH
6. The category: transport, energy, food, waste, or shopping

Focus on the largest emission categories first. Be realistic about what is achievable in India.
Reference specific Indian alternatives (e.g. Metro rail, BEST bus, CNG auto, BEE 5-star AC, LPG to induction).

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "rec_1",
    "title": "...",
    "description": "...",
    "estimatedReductionKgCO2": 0,
    "difficulty": "EASY",
    "costImplication": "SAVINGS",
    "impactRank": 1,
    "confidencePercent": 85,
    "category": "transport"
  }
]`;
}

/** Parses Gemini's raw JSON response into typed recommendations. */
function parseRecommendations(rawText: string): AiRecommendation[] {
  try {
    // Extract JSON array from response (handles markdown code blocks)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 5).map((item: any, i: number) => ({
      id: item.id || `rec_${i + 1}`,
      title: String(item.title || 'Recommendation'),
      description: String(item.description || ''),
      estimatedReductionKgCO2: Number(item.estimatedReductionKgCO2) || 0,
      difficulty: (['EASY', 'MEDIUM', 'HARD'].includes(item.difficulty) ? item.difficulty : 'MEDIUM') as any,
      costImplication: (['SAVINGS', 'LOW', 'MODERATE', 'HIGH'].includes(item.costImplication) ? item.costImplication : 'MODERATE') as any,
      impactRank: Number(item.impactRank) || i + 1,
      confidencePercent: Math.min(100, Math.max(0, Number(item.confidencePercent) || 80)),
      category: (['transport', 'energy', 'food', 'waste', 'shopping'].includes(item.category) ? item.category : 'energy') as any,
    }));
  } catch {
    return [];
  }
}

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
 * Checks cache first, then calls Gemini if needed.
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
    void logAiCall({ assessmentId, fromCache: true, latencyMs: 0, success: true });
    return { recommendations: cachedAdvice, fromCache: true };
  }

  // 2. Check rate limit
  const rateLimitKey = `ai_${assessmentId}`;
  if (isRateLimited(rateLimitKey)) {
    void logAiCall({ assessmentId, fromCache: false, latencyMs: 0, success: false, error: 'rate_limited' });
    return {
      recommendations: buildFallbackRecommendations(result),
      fromCache: false,
      error: 'Rate limit active. Showing estimate-based recommendations.'
    };
  }

  // 3. Check API key availability
  if (!GEMINI_API_KEY) {
    return {
      recommendations: buildFallbackRecommendations(result),
      fromCache: false,
      error: 'AI recommendations require a VITE_GEMINI_API_KEY environment variable.'
    };
  }

  // 4. Call Gemini (with PII-free prompt)
  const startMs = Date.now();
  try {
    rateLimitMap.set(rateLimitKey, Date.now());
    const prompt = buildAnonymizedPrompt(result, stateHint, dietHint);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const recommendations = parseRecommendations(rawText);
    const latencyMs = Date.now() - startMs;

    if (recommendations.length === 0) {
      throw new Error('No valid recommendations parsed from response');
    }

    void logAiCall({ assessmentId, fromCache: false, latencyMs, success: true });
    return { recommendations, fromCache: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI error';
    void logAiCall({ assessmentId, fromCache: false, latencyMs: Date.now() - startMs, success: false, error: errorMsg });
    return {
      recommendations: buildFallbackRecommendations(result),
      fromCache: false,
      error: `AI unavailable: ${errorMsg}. Showing rule-based recommendations.`
    };
  }
}
