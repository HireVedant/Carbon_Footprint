/**
 * Firestore Backward-Compatible Document Migration & Schema Normalizer
 * Ensures older assessment objects seamlessly match v2.0 standards without data loss.
 */

import { CalculationResult } from './calculationEngine';

export interface NormalizedAssessmentDocument {
  id: string;
  userId: string;
  timestamp: string;
  calculatorVersion: string;
  datasetVersion: string;
  aiPromptVersion: string;
  aiModel: string;
  mode: 'quick' | 'detailed';
  location: {
    country: string;
    state: string;
    district?: string;
    city?: string;
    dwelling?: string;
  };
  emissions: {
    totalKgCO2PerYear: number;
    totalTonnesCO2PerYear: number;
    breakdown: {
      transport: number;
      energy: number;
      food: number;
      waste: number;
      shopping: number;
    };
    percentages?: {
      transport: number;
      energy: number;
      food: number;
      waste: number;
      shopping: number;
    };
  };
  confidence: {
    overallScore: number;
    overallRating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
    rationales?: string[];
  };
  answers: Record<string, any>;
  aiAdvice: any[];
  status: 'approved' | 'pending_review' | 'rejected';
  isTestAccount?: boolean;
}

/**
 * Normalizes any legacy or missing fields in a Firestore assessment document.
 */
export function normalizeAssessmentDocument(doc: any, docId?: string): NormalizedAssessmentDocument {
  const safeId = docId || doc?.id || `legacy_${Date.now()}`;
  const safeUserId = doc?.userId || doc?.uid || 'anonymous';
  const safeTimestamp = doc?.timestamp || doc?.createdAt || new Date().toISOString();

  // Extract emissions
  const rawTotalKg = doc?.emissions?.totalKgCO2PerYear || doc?.totalEmissions || doc?.emissions?.total || 3000;
  const rawTotalTonnes = doc?.emissions?.totalTonnesCO2PerYear || Math.round((rawTotalKg / 1000) * 100) / 100;

  const rawBreakdown = doc?.emissions?.breakdown || doc?.breakdown || {
    transport: rawTotalKg * 0.35,
    energy: rawTotalKg * 0.35,
    food: rawTotalKg * 0.15,
    waste: rawTotalKg * 0.08,
    shopping: rawTotalKg * 0.07
  };

  const safeBreakdown = {
    transport: Math.round(rawBreakdown.transport || 0),
    energy: Math.round(rawBreakdown.energy || 0),
    food: Math.round(rawBreakdown.food || 0),
    waste: Math.round(rawBreakdown.waste || 0),
    shopping: Math.round(rawBreakdown.shopping || 0)
  };

  // Safe Location
  const safeLocation = {
    country: 'India',
    state: doc?.location?.state || doc?.state || 'Delhi',
    district: doc?.location?.district || doc?.district,
    city: doc?.location?.city || doc?.city,
    dwelling: doc?.location?.dwelling || doc?.dwelling || 'Apartment'
  };

  // Safe Confidence
  const safeConfidence = {
    overallScore: doc?.confidence?.overallScore || doc?.confidence?.score || 75,
    overallRating: doc?.confidence?.overallRating || (doc?.confidence?.overallScore >= 85 ? 'HIGH' : 'MEDIUM') as any,
    rationales: doc?.confidence?.rationales || ['Legacy calculation imported with standard defaults']
  };

  return {
    id: safeId,
    userId: safeUserId,
    timestamp: safeTimestamp,
    calculatorVersion: doc?.calculatorVersion || '1.0.0-legacy',
    datasetVersion: doc?.datasetVersion || 'legacy-v1',
    aiPromptVersion: doc?.aiPromptVersion || '1.0',
    aiModel: doc?.aiModel || 'gemini-3.6-flash',
    mode: doc?.mode || 'quick',
    location: safeLocation,
    emissions: {
      totalKgCO2PerYear: Math.round(rawTotalKg * 10) / 10,
      totalTonnesCO2PerYear: rawTotalTonnes,
      breakdown: safeBreakdown,
      percentages: doc?.emissions?.percentages || {
        energy: Math.round((safeBreakdown.energy / rawTotalKg) * 100) || 35,
        transport: Math.round((safeBreakdown.transport / rawTotalKg) * 100) || 35,
        food: Math.round((safeBreakdown.food / rawTotalKg) * 100) || 15,
        waste: Math.round((safeBreakdown.waste / rawTotalKg) * 100) || 8,
        shopping: Math.round((safeBreakdown.shopping / rawTotalKg) * 100) || 7
      }
    },
    confidence: safeConfidence,
    answers: doc?.answers || doc?.inputs || {},
    aiAdvice: Array.isArray(doc?.aiAdvice) ? doc.aiAdvice : Array.isArray(doc?.recommendations) ? doc.recommendations : [],
    status: doc?.status || 'approved',
    isTestAccount: Boolean(doc?.isTestAccount)
  };
}
