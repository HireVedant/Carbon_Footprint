// ─────────────────────────────────────────────────────────────────────────────
// Community Analytics Service
// Real-time Firestore aggregation for EcoTrack AI Community Dashboard.
//
// Architecture & Assumptions:
//   - Reads from 3 aggregated collections (communityStats, communityLeaderboard,
//     communityReports) so the Community page only does O(1) Firestore reads.
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
  deleteDoc,
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
  RecentReport,
  EmissionBreakdown,
} from '../types/community';

// ── Collection / document paths ───────────────────────────────────────────────
const COMMUNITY_STATS_DOC = doc(db, 'communityStats', 'global');
const LEADERBOARD_COL = collection(db, 'communityLeaderboard');
const REPORTS_COL = collection(db, 'communityReports');

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
  callback: (stats: CommunityStats | null) => void
): () => void {
  return onSnapshot(COMMUNITY_STATS_DOC, (snap) => {
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
  });
}

/**
 * Subscribes to the community leaderboard (sorted by ecoScore desc, top 10).
 * Returns an unsubscribe function.
 */
export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void
): () => void {
  const q = query(LEADERBOARD_COL, orderBy('ecoScore', 'desc'), limit(10));
  return onSnapshot(q, (snap) => {
    const entries: LeaderboardEntry[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        displayName: data.displayName ?? 'Anonymous User',
        ecoScore: data.ecoScore ?? 0,
        annualEstimate: data.annualEstimate ?? 0,
        ecoLabel: data.ecoLabel ?? '',
        highestCategory: data.highestCategory ?? 'Transport',
        updatedAt: toDate(data.updatedAt),
      };
    });
    callback(entries);
  });
}

/**
 * Subscribes to the most recent anonymized community reports.
 * Returns an unsubscribe function.
 */
export function subscribeToRecentReports(
  callback: (reports: RecentReport[]) => void,
  limitCount: number = 10
): () => void {
  const q = query(REPORTS_COL, orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snap) => {
    const reports: RecentReport[] = snap.docs.map((d, idx) => {
      const data = d.data();
      return {
        id: d.id,
        displayName: privacySafeName(data.displayName, idx),
        ecoScore: data.ecoScore ?? 0,
        annualEstimate: data.annualEstimate ?? 0,
        ecoLabel: data.ecoLabel ?? '',
        highestCategory: data.highestCategory ?? 'Transport',
        createdAt: toDate(data.createdAt),
      };
    });
    callback(reports);
  });
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
  try {
    const {
      userId, calculationId, displayName,
      transportEmission, energyEmission, foodEmission, wasteEmission,
      totalEmission, ecoScore, ecoLabel, annualEstimate, totalUsers,
    } = payload;

    const topCategory = highestCategory(transportEmission, energyEmission, foodEmission, wasteEmission);
    const safeName = privacySafeName(displayName, -1);

    await runTransaction(db, async (transaction) => {
      // 1. Fetch current communityStats document
      const statsSnap = await transaction.get(COMMUNITY_STATS_DOC);
      const leaderboardRef = doc(db, 'communityLeaderboard', userId);
      const existingLeader = await transaction.get(leaderboardRef);

      const prev = statsSnap.exists() ? statsSnap.data() : null;
      const existingScore: number = existingLeader.exists() ? (existingLeader.data().ecoScore ?? 0) : 0;

      const prevReports: number = prev?.totalReports ?? 0;
      const prevTotal: number = prev?.totalCO2Tracked ?? 0;
      const prevBreakdown: EmissionBreakdown = prev?.emissionBreakdown ?? { transport: 0, energy: 0, food: 0, waste: 0 };
      const prevScoreSum: number = (prev?.averageEcoScore ?? 0) * prevReports;

      const newReports = prevReports + 1;
      const newTotalCO2 = prevTotal + totalEmission;
      const newAvgCO2 = parseFloat(((newTotalCO2 / 1000) / newReports).toFixed(3));
      const newAvgScore = parseFloat(((prevScoreSum + ecoScore) / newReports).toFixed(1));
      const newBreakdown: EmissionBreakdown = {
        transport: prevBreakdown.transport + transportEmission,
        energy: prevBreakdown.energy + energyEmission,
        food: prevBreakdown.food + foodEmission,
        waste: prevBreakdown.waste + wasteEmission,
      };

      // 2. Write aggregated stats
      transaction.set(
        COMMUNITY_STATS_DOC,
        {
          totalUsers,
          totalReports: newReports,
          totalCO2Tracked: newTotalCO2,
          averageAnnualCO2: newAvgCO2,
          averageEcoScore: newAvgScore,
          emissionBreakdown: newBreakdown,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 3. Write/overwrite leaderboard entry for this user (best score wins)
      if (ecoScore >= existingScore) {
        transaction.set(leaderboardRef, {
          displayName: safeName,
          ecoScore,
          annualEstimate,
          ecoLabel,
          highestCategory: topCategory,
          updatedAt: serverTimestamp(),
        });
      }

      // 4. Write anonymized recent report
      const reportRef = doc(db, 'communityReports', calculationId);
      transaction.set(reportRef, {
        displayName: safeName,
        ecoScore,
        annualEstimate,
        ecoLabel,
        highestCategory: topCategory,
        createdAt: serverTimestamp(),
      });
    });
  } catch (err) {
    // Non-fatal: analytics failure must never block the user's calculation save
    console.warn('[CommunityAnalytics] Failed to update aggregates:', err);
  }
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
  try {
    const reportRef = doc(db, 'communityReports', payload.calculationId);
    const leaderboardRef = doc(db, 'communityLeaderboard', payload.userId);

    await runTransaction(db, async (transaction) => {
      const statsSnap = await transaction.get(COMMUNITY_STATS_DOC);
      if (!statsSnap.exists()) return;
      
      const prev = statsSnap.data();
      const prevReports: number = prev.totalReports ?? 1;
      const newReports = Math.max(0, prevReports - 1);

      if (newReports === 0) {
        transaction.set(COMMUNITY_STATS_DOC, {
          totalReports: 0,
          totalCO2Tracked: 0,
          averageAnnualCO2: 0,
          averageEcoScore: 0,
          emissionBreakdown: { transport: 0, energy: 0, food: 0, waste: 0 },
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        const prevTotal: number = prev.totalCO2Tracked ?? 0;
        const newTotal = Math.max(0, prevTotal - payload.removedEmission);
        
        const prevScoreSum: number = (prev.averageEcoScore ?? 0) * prevReports;
        const newAvgScore = parseFloat(((prevScoreSum - payload.removedScore) / newReports).toFixed(1));
        const newAvgCO2 = parseFloat(((newTotal / 1000) / newReports).toFixed(3));

        const prevBreakdown = prev.emissionBreakdown ?? { transport: 0, energy: 0, food: 0, waste: 0 };
        const newBreakdown = {
          transport: Math.max(0, prevBreakdown.transport - payload.removedBreakdown.transport),
          energy: Math.max(0, prevBreakdown.energy - payload.removedBreakdown.energy),
          food: Math.max(0, prevBreakdown.food - payload.removedBreakdown.food),
          waste: Math.max(0, prevBreakdown.waste - payload.removedBreakdown.waste),
        };

        transaction.set(COMMUNITY_STATS_DOC, {
          totalReports: newReports,
          totalCO2Tracked: newTotal,
          averageAnnualCO2: newAvgCO2,
          averageEcoScore: Math.max(0, newAvgScore),
          emissionBreakdown: newBreakdown,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      transaction.delete(reportRef);

      if (!payload.hasRemaining) {
        transaction.delete(leaderboardRef);
      }
    });
  } catch (err) {
    console.warn('[CommunityAnalytics] Failed to remove community entry:', err);
  }
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
