// ─────────────────────────────────────────────────────────────────────────────
// useCommunityStats — React Hook
// Subscribes to all 3 real-time community Firestore collections.
// Properly unsubscribes on unmount — zero memory leaks.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  subscribeToCommunityStats,
  subscribeToLeaderboard,
  subscribeToRecentReports,
} from '../services/communityAnalyticsService';
import { getSEIInsights } from '../services/seiDatasetService';
import type {
  CommunityStats,
  LeaderboardEntry,
  RecentReport,
  CommunityInsight,
} from '../types/community';

interface UseCommunityStatsReturn {
  stats: CommunityStats | null;
  leaderboard: LeaderboardEntry[];
  recentReports: RecentReport[];
  insights: CommunityInsight[];
  loading: boolean;
  error: string | null;
}

export function useCommunityStats(): UseCommunityStatsReturn {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Stable callbacks (memoized to avoid re-subscription on each render) ────

  const handleStats = useCallback((data: CommunityStats | null) => {
    setStats(data);
    setLoadingStats(false);
  }, []);

  const handleLeaderboard = useCallback((data: LeaderboardEntry[]) => {
    setLeaderboard(data);
    setLoadingLeaderboard(false);
  }, []);

  const handleReports = useCallback((data: RecentReport[]) => {
    setRecentReports(data);
    setLoadingReports(false);
  }, []);

  // ── Subscribe to all 3 real-time listeners ───────────────────────────────

  useEffect(() => {
    let unsubStats: (() => void) | undefined;
    let unsubLeaderboard: (() => void) | undefined;
    let unsubReports: (() => void) | undefined;

    try {
      unsubStats = subscribeToCommunityStats(handleStats);
      unsubLeaderboard = subscribeToLeaderboard(handleLeaderboard);
      unsubReports = subscribeToRecentReports(handleReports, 10);
    } catch (err) {
      setError('Failed to connect to community data. Please try again later.');
      setLoadingStats(false);
      setLoadingLeaderboard(false);
      setLoadingReports(false);
    }

    // Cleanup: unsubscribe all listeners when component unmounts
    return () => {
      unsubStats?.();
      unsubLeaderboard?.();
      unsubReports?.();
    };
  }, [handleStats, handleLeaderboard, handleReports]);

  // ── Derived insights (memoized — only recomputes when stats/leaderboard change) ──

  const insights = useMemo<CommunityInsight[]>(() => {
    const seiInsights: CommunityInsight[] = getSEIInsights().map((i) => ({
      ...i,
      source: 'sei' as const,
    }));

    const liveInsights: CommunityInsight[] = [];

    if (stats && stats.totalReports > 0) {
      liveInsights.push({
        id: 'live-1',
        icon: '🌍',
        text: `Community average footprint: ${stats.averageAnnualCO2.toFixed(2)} tons CO₂/year across ${stats.totalReports} report${stats.totalReports !== 1 ? 's' : ''}.`,
        source: 'live',
      });
    }

    if (leaderboard.length > 0) {
      const top = leaderboard[0];
      liveInsights.push({
        id: 'live-2',
        icon: '🏆',
        text: `Top community performer: ${top.displayName} with an eco score of ${top.ecoScore}/100 (${top.ecoLabel}).`,
        source: 'live',
      });
    }

    if (stats && stats.emissionBreakdown) {
      const { transport, energy, food, waste } = stats.emissionBreakdown;
      const total = transport + energy + food + waste;
      if (total > 0) {
        const dominant = Object.entries({ Transport: transport, Energy: energy, Food: food, Waste: waste })
          .sort((a, b) => b[1] - a[1])[0][0];
        const pct = ((transport + energy + food + waste > 0)
          ? (Math.max(transport, energy, food, waste) / total) * 100
          : 0
        ).toFixed(1);
        liveInsights.push({
          id: 'live-3',
          icon: '📊',
          text: `${dominant} is the dominant emission category in live data, contributing ${pct}% of tracked CO₂.`,
          source: 'live',
        });
      }
    }

    return [...seiInsights, ...liveInsights];
  }, [stats, leaderboard]);

  const loading = loadingStats || loadingLeaderboard || loadingReports;

  return { stats, leaderboard, recentReports, insights, loading, error };
}
