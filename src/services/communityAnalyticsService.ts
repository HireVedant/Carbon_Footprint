// ─────────────────────────────────────────────────────────────────────────────
// Community Analytics Service
// Real-time Firestore aggregation for EcoTrack AI Community Dashboard.
//
// Architecture & Assumptions:
//   - Reads communityStats and communityLeaderboard for the Community page.
//   - communityReports remains a write-only historical aggregate for generated reports.
//   - Writes to all 3 collections via Firestore runTransaction to avoid race conditions.
//   - No raw 'calculations' data is ever exposed publicly (privacy first).
//
// Collection Schemas & Units:
//   - `communityStats/global`: {
//       totalUsers: number (count),
//       totalReports: number (count),
//       totalCO2Tracked: number (kilograms CO2),
//       averageAnnualCO2: number (tons CO2/yr),
//       averageEcoScore: number (0-100),
//       emissionBreakdown: { transport, energy, food, waste } (all in kg CO2)
//     }
//   - `communityLeaderboard/{userId}`: Highest score per user. { annualEstimate: tons/yr }
//   - `communityReports/{calculationId}`: Anonymized recent reports. { annualEstimate: tons/yr }
// ─────────────────────────────────────────────────────────────────────────────
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type {
  CommunityStats,
  LeaderboardEntry,
  EmissionBreakdown,
} from '../types/community';

// ── Collection / document paths ───────────────────────────────────────────────
const COMMUNITY_STATS_DOC = doc(db, 'communityStats', 'global');
const LEADERBOARD_COL = collection(db, 'communityLeaderboard');

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  return null;
}

function highestCategory(
  transport: number,
  energy: number,
  food: number,
  waste: number
): string {
  const map: Record<string, number> = { Transport: transport, Energy: energy, Food: food, Waste: waste };
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0][0];
}

function privacySafeName(name: string | undefined | null, index: number): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return parts[0];
  }
  return index >= 0 ? `Eco User #${index + 1}` : 'Anonymous User';
}

// ── Real-time Subscriptions ───────────────────────────────────────────────────

/**
 * Subscribes to the single aggregated community stats document.
 * Returns an unsubscribe function — always call it on component unmount.
 */
export function subscribeToCommunityStats(
  callback: (stats: CommunityStats | null) => void,
  onError?: (error: string) => void
): () => void {
  return onSnapshot(
    COMMUNITY_STATS_DOC,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const d = snap.data();
      callback({
        totalUsers: d.totalUsers ?? 0,
        totalReports: d.totalReports ?? 0,
        totalCO2Tracked: d.totalCO2Tracked ?? 0,
        averageAnnualCO2: d.averageAnnualCO2 ?? 0,
        averageEcoScore: d.averageEcoScore ?? 0,
        emissionBreakdown: d.emissionBreakdown ?? { transport: 0, energy: 0, food: 0, waste: 0 },
        updatedAt: toDate(d.updatedAt),
      });
    },
    (err) => {
      console.error('[CommunityAnalytics] Error in communityStats listener:', err);
      callback(null);
      onError?.(err?.message || 'Failed to load community statistics. Please try again later.');
    }
  );
}

/**
 * Subscribes to the community leaderboard (sorted by ecoScore desc, top 10).
 * Returns an unsubscribe function.
 */
export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  onError?: (error: string) => void
): () => void {
  const q = query(LEADERBOARD_COL, orderBy('ecoScore', 'desc'), limit(10));
  return onSnapshot(
    q,
    (snap) => {
      const entries: LeaderboardEntry[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          userId: d.id,
          displayName: data.isAnonymous ? 'Anonymous User' : (data.displayName ?? 'Anonymous User'),
          ecoScore: data.ecoScore ?? 0,
          annualEstimate: data.annualEstimate ?? 0,
          ecoLabel: data.ecoLabel ?? '',
          highestCategory: data.highestCategory ?? 'Transport',
          isAnonymous: !!data.isAnonymous,
          updatedAt: toDate(data.updatedAt),
        };
      });
      callback(entries);
    },
    (err) => {
      console.error('[CommunityAnalytics] Error in leaderboard listener:', err);
      callback([]);
      onError?.(err?.message || 'Failed to load the leaderboard. Please try again later.');
    }
  );
}


// ── Aggregation Writers ───────────────────────────────────────────────────────

export interface CalcPayload {
  userId: string;
  calculationId: string;
  displayName: string;
  transportEmission: number;
  energyEmission: number;
  foodEmission: number;
  wasteEmission: number;
  totalEmission: number;
  ecoScore: number;
  ecoLabel: string;
  annualEstimate: number;
  totalUsers: number;
}

/**
 * Updates all 3 aggregated community collections after a new calculation is saved.
 * Called from CalculatorContext after saveCalculation succeeds.
 *
 * Uses a simple replace strategy on communityStats (re-fetches and recalculates).
 * For production scale, a Cloud Function with increment would be preferable.
 */
export async function updateCommunityAggregates(payload: CalcPayload): Promise<void> {
  // ── 🔒 ARCHITECTURE UPDATE ────────────────────────────────────────────────
  // Aggregation is now securely handled by Firebase Cloud Functions.
  // The 'onAssessmentCreated' trigger in functions/src/index.ts automatically 
  // updates the global 'communityStats' and 'communityLeaderboard' securely 
  // when a new assessment document is saved to Firestore.
  // 
  // This client-side function is retained purely for backward compatibility 
  // with the existing React context calls, preventing any UI breakage.
  // ────────────────────────────────────────────────────────────────────────
  console.log('[CommunityAnalytics] Assessment saved. Cloud Functions will handle the secure aggregation.');
  return Promise.resolve();
}

/**
 * Removes a community report and updates the communityStats totals when
 * a calculation is deleted by a user.
 */
export async function removeCommunityEntry(payload: {
  calculationId: string;
  userId: string;
  hasRemaining: boolean;
  removedEmission: number;
  removedScore: number;
  removedBreakdown: EmissionBreakdown;
}): Promise<void> {
  // ── 🔒 ARCHITECTURE UPDATE ────────────────────────────────────────────────
  // Similar to updateCommunityAggregates, deletions are now handled by the
  // 'onAssessmentDeleted' Cloud Function.
  // ────────────────────────────────────────────────────────────────────────
  console.log('[CommunityAnalytics] Assessment deleted. Cloud Functions will handle the secure aggregation cleanup.');
  return Promise.resolve();
}

/**
 * Updates the totalUsers count in communityStats.
 * Called after a new user registers.
 */
export async function updateUserCount(totalUsers: number): Promise<void> {
  try {
    await setDoc(
      COMMUNITY_STATS_DOC,
      { totalUsers, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn('[CommunityAnalytics] Failed to update user count:', err);
  }
}

/**
 * Toggles anonymous mode for a user's leaderboard entry.
 */
export async function toggleAnonymousRanking(userId: string, isAnonymous: boolean): Promise<void> {
  if (!userId) return;
  try {
    const leaderboardRef = doc(db, 'communityLeaderboard', userId);
    await setDoc(leaderboardRef, { isAnonymous, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error('[CommunityAnalytics] Failed to toggle anonymous ranking:', err);
    throw err;
  }
}
