/**
 * Leaderboard Tab — Dashboard
 *
 * Shows the community leaderboard from Firestore (communityLeaderboard
 * collection) via useCommunityStats, with loading / empty / error states.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader2, AlertTriangle, Users } from 'lucide-react';
import { useCommunityStats } from '../../../hooks/useCommunityStats';
import { useAuth } from '../../../context/AuthContext';
import type { LeaderboardEntry } from '../../../types/community';

const chip = (score: number): string => {
  if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 70) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-orange-700 bg-orange-50 border-orange-200';
};

const Row: React.FC<{ entry: LeaderboardEntry; rank: number; isYou: boolean }> = ({ entry, rank, isYou }) => {
  const updated = entry.updatedAt
    ? entry.updatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min((rank - 1) * 0.04, 0.3) }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={
        isYou
          ? { background: 'rgba(47,107,79,0.06)', border: '1px solid rgba(47,107,79,0.18)' }
          : { border: '1px solid transparent' }
      }
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={
          rank <= 3
            ? { background: 'rgba(47,107,79,0.08)', border: '1px solid rgba(47,107,79,0.22)', color: 'var(--color-success)' }
            : { background: 'var(--border-subtle)', color: 'var(--text-tertiary)' }
        }
      >
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {entry.displayName}
          {isYou && <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-emerald-700">You</span>}
        </p>
        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {entry.highestCategory} · Updated {updated}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {entry.annualEstimate} <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>t/yr</span>
        </p>
        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border mt-1 ${chip(entry.ecoScore)}`}>
          {entry.ecoLabel || `${entry.ecoScore}/100`}
        </span>
      </div>
    </motion.div>
  );
};

export const LeaderboardTab: React.FC = () => {
  const { leaderboard, loading, error } = useCommunityStats();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="surface-elevated p-6 rounded-3xl"
      >
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="w-4 h-4 text-amber-600" />
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Community Leaderboard</h3>
            <p className="text-[10px] text-dark-500">Top eco scores across EcoTrack AI users</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <p className="text-sm text-dark-500">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Could not load the leaderboard</p>
            <p className="text-xs text-dark-500 max-w-sm">{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Users className="w-10 h-10 text-dark-500" />
            <p className="text-sm text-dark-500">
              No community data available yet.
              <br />
              Complete your assessment to join the leaderboard.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <Row
                key={entry.userId}
                entry={entry}
                rank={index + 1}
                isYou={!!user && entry.userId === user.uid}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};