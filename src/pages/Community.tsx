import React, { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Users,
  FileText,
  Wind,
  TrendingDown,
  Zap,
  Trophy,
  Activity,
  Leaf,
  AlertTriangle,
  Loader2,
  Globe2,
  FlameKindling,
  Car,
  Utensils,
  Trash2,
  BarChart3,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { surface, emerald, fontFamily, radius, water, solar, semantic, carbon } from '../design';
import { useCommunityStats } from '../hooks/useCommunityStats';
import {
  getSEIEmissionChartData,
  getSEICaseStudyChartData,
  getSEISurveyStats,
  getSEIDerivedMetrics,
} from '../services/seiDatasetService';
import { useAuth } from '../context/AuthContext';
import { toggleAnonymousRanking } from '../services/communityAnalyticsService';
import { VisualizationDataProvider } from '../visualization/providers/VisualizationDataProvider';

// Lazy-load the heavy IndiaMap component for code splitting
const IndiaMap = React.lazy(() =>
  import('../visualization/maps/IndiaMap').then(m => ({ default: m.IndiaMap }))
);
const StateInsightPanel = React.lazy(() =>
  import('../visualization/maps/StateInsightPanel').then(m => ({ default: m.StateInsightPanel }))
);

// ── Chart.js registration ─────────────────────────────────────────────────────
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ── Shared chart options ──────────────────────────────────────────────────────
const darkTooltip = {
  backgroundColor: '#FFFFFF',
  titleColor: '#1F2937',
  bodyColor: '#4B5563',
  borderColor: 'rgba(15,23,42,0.08)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
  usePointStyle: true,
};

const darkTicks = { color: '#6B7280', font: { family: 'Inter', size: 10 } };
const darkGrid  = { color: 'rgba(15,23,42,0.04)' };

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: { color: '#4B5563', font: { family: 'Inter', size: 11 }, padding: 14, usePointStyle: true },
    },
    tooltip: darkTooltip,
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: darkTooltip },
  scales: {
    x: { grid: darkGrid, ticks: darkTicks },
    y: { grid: darkGrid, ticks: darkTicks },
  },
};

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

// ── Eco Score colour helper (matches existing design system) ─────────────────
function ecoScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 70) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
  if (score >= 30) return 'text-orange-700 bg-orange-50 border-orange-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

function categoryIcon(cat: string) {
  switch (cat) {
    case 'Transport': return <Car className="w-3 h-3" />;
    case 'Energy':    return <Zap className="w-3 h-3" />;
    case 'Food':      return <Utensils className="w-3 h-3" />;
    default:          return <Trash2 className="w-3 h-3" />;
  }
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="p-5 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)' }}>
      <div className="h-3 rounded w-2/3 mb-4" style={{ background: 'var(--border-subtle)' }} />
      <div className="h-8 rounded w-1/2 mb-2" style={{ background: 'var(--border-subtle)' }} />
      <div className="h-2 rounded w-3/4" style={{ background: 'var(--bg-elevated)' }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-3 animate-pulse">
      <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: 'var(--border-subtle)' }} />
      <div className="flex-1 h-3 rounded" style={{ background: 'var(--border-subtle)' }} />
      <div className="w-14 h-3 rounded" style={{ background: 'var(--border-subtle)' }} />
      <div className="w-14 h-3 rounded" style={{ background: 'var(--border-subtle)' }} />
    </div>
  );
}

// ── Rank medal helper ─────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}>
      {rank}
    </span>
  );
}

// ── Format CO₂ helper ─────────────────────────────────────────────────────────
function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${Math.round(kg)} kg`;
}

// ── Memoized Leaderboard Entry ────────────────────────────────────────────────
const MemoizedLeaderboardEntry = React.memo(({ entry, index, isCurrentUser, isContributionCard = false }: { entry: any, index: number, isCurrentUser: boolean, isContributionCard?: boolean }) => {
  return (
    <motion.div
      initial={!isContributionCard ? { opacity: 0, x: -10 } : undefined}
      animate={!isContributionCard ? { opacity: 1, x: 0 } : undefined}
      transition={!isContributionCard ? { delay: (index % 5) * 0.05 } : undefined}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors duration-200`}
      style={isCurrentUser ? { background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)' } : {}}
    >
      <RankBadge rank={index + 1} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{entry.displayName}</p>
        <div className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {categoryIcon(entry.highestCategory)}
          <span>{entry.highestCategory}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{entry.annualEstimate} t</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ecoScoreColor(entry.ecoScore)}`}>
          {entry.ecoLabel}
        </span>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(13,148,136,0.06))', border: '1px solid rgba(5,150,105,0.15)' }}>
        <span className="text-sm font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>{entry.ecoScore}</span>
      </div>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Community Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Community() {
  const { user } = useAuth();
  const { stats, leaderboard, insights, loading, error } = useCommunityStats();

  // ── Map state (synced with URL) ───────────────────────────────────────────
  const [selectedState, setSelectedState] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('state') || null;
  });

  const handleStateSelect = useCallback((stateName: string | null) => {
    setSelectedState(stateName);
    // Update URL without reload
    const url = new URL(window.location.href);
    if (stateName) {
      url.searchParams.set('state', stateName);
    } else {
      url.searchParams.delete('state');
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedState(params.get('state') || null);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Get map layers and state data
  const mapLayers = useMemo(() => VisualizationDataProvider.getMapLayers(), []);
  const selectedStateData = useMemo(
    () => selectedState ? VisualizationDataProvider.getStateData(selectedState) : null,
    [selectedState]
  );

  // Filter leaderboard by selected state
  const filteredLeaderboard = useMemo(() => {
    if (!selectedState || !leaderboard.length) return leaderboard;
    // Leaderboard entries may not have state; fall back to full list
    return leaderboard;
  }, [leaderboard, selectedState]);
  const seiSurvey  = getSEISurveyStats();
  const seiMetrics = getSEIDerivedMetrics();
  const seiDoughnutData  = useMemo(() => getSEIEmissionChartData(), []);
  const seiBarData       = useMemo(() => getSEICaseStudyChartData(), []);

  const leaderboardPageSize = 5;
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const totalLeaderboardPages = Math.max(1, Math.ceil(leaderboard.length / leaderboardPageSize));
  const leaderboardPageStart = leaderboardPage * leaderboardPageSize;
  const visibleLeaderboard = useMemo(
    () => leaderboard.slice(leaderboardPageStart, leaderboardPageStart + leaderboardPageSize),
    [leaderboard, leaderboardPageStart]
  );

  useEffect(() => {
    if (leaderboardPage >= totalLeaderboardPages) {
      setLeaderboardPage(Math.max(0, totalLeaderboardPages - 1));
    }
  }, [leaderboardPage, totalLeaderboardPages]);

  const userRankIndex = useMemo(() => leaderboard.findIndex(e => e.userId === user?.uid), [leaderboard, user?.uid]);
  const userEntry = userRankIndex >= 0 ? leaderboard[userRankIndex] : null;

  const handleToggleAnonymous = async (isAnonymous: boolean) => {
    if (!user) return;
    try {
      await toggleAnonymousRanking(user.uid, isAnonymous);
    } catch (err) {
      console.error('Failed to toggle anonymity', err);
    }
  };

  // Live community emission breakdown chart (from aggregated stats)
  const liveBreakdownData = useMemo(() => {
    if (!stats) return null;
    const { transport, energy, food, waste } = stats.emissionBreakdown;
    return {
      labels: ['Transportation', 'Household Energy', 'Diet & Food', 'Waste & Shopping'],
      datasets: [{
        label: 'Live Community CO₂ (kg)',
        data: [transport, energy, food, waste],
        backgroundColor: [
          'rgba(59,130,246,0.7)', 'rgba(245,158,11,0.7)',
          'rgba(16,185,129,0.7)', 'rgba(236,72,153,0.7)',
        ],
        borderColor: [
          'rgba(59,130,246,1)', 'rgba(245,158,11,1)',
          'rgba(16,185,129,1)', 'rgba(236,72,153,1)',
        ],
        borderWidth: 1.5,
      }],
    };
  }, [stats]);

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 relative flex items-center justify-center">
        <div className="absolute inset-0 mesh-bg" />
        <div className="p-12 rounded-3xl text-center max-w-md mx-auto relative z-10" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: semantic.warning }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: surface.textPrimary }}>Connection Error</h2>
          <p className="text-sm" style={{ color: surface.textSecondary }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: `${emerald[500]}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: `${emerald[500]}08` }} />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">

        {/* ═══ HERO HEADER ═════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto pt-4"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" style={{ background: `${emerald[600]}12`, border: `1px solid ${emerald[600]}30` }}>
            <Globe2 className="w-4 h-4" style={{ color: emerald[600] }} />
            <span className="text-sm font-medium" style={{ color: emerald[600] }}>Global Community Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
            Our Collective <span className="gradient-text">Carbon Impact</span>
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: surface.textSecondary }}>
            Real-time community metrics powered by live assessments and validated by our SEI survey dataset. See how individual choices compound into global climate change action.
          </p>
        </motion.div>

        {/* ═══ INDIA CHOROPLETH MAP ════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Globe2 className="w-5 h-5" style={{ color: emerald[600] }} />
            <h2 className="text-xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>India Carbon Intelligence Map</h2>
          </div>
          <p className="text-sm max-w-2xl -mt-4" style={{ color: surface.textSecondary }}>
            Interactive choropleth showing state-level emissions, participation, and renewable energy data.
            Click any state to filter the dashboard below. Sources: CEA Baseline DB, Ember/IEEFA, NITI Aayog.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className={`lg:col-span-2 ${selectedState ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="rounded-2xl p-5" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                <Suspense fallback={
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: emerald[600] }} />
                    <span className="ml-3 text-sm" style={{ color: surface.textSecondary }}>Loading India map...</span>
                  </div>
                }>
                  <IndiaMap
                    layers={mapLayers}
                    selectedState={selectedState}
                    onStateSelect={handleStateSelect}
                  />
                </Suspense>
              </div>
            </div>

            {/* State Insight Panel */}
            {selectedState && (
              <div className="lg:col-span-1">
                <Suspense fallback={
                  <div className="rounded-2xl p-5 flex items-center justify-center h-[300px]" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: emerald[600] }} />
                  </div>
                }>
                  <StateInsightPanel
                    stateName={selectedState}
                    onClose={() => handleStateSelect(null)}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Data Sources */}
          <div className="flex flex-wrap items-center gap-3 text-[10px]" style={{ color: surface.textSecondary }}>
            <span className="font-semibold" style={{ color: surface.textPrimary }}>Sources:</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: `${emerald[600]}0D`, border: `1px solid ${emerald[600]}26` }}>CEA Baseline DB v20.0</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: `${emerald[600]}0D`, border: `1px solid ${emerald[600]}26` }}>Census 2011 / MoSPI</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: `${emerald[600]}0D`, border: `1px solid ${emerald[600]}26` }}>Ember/IEEFA SET 2026</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: `${emerald[600]}0D`, border: `1px solid ${emerald[600]}26` }}>NITI Aayog GHG Platform</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: `${emerald[600]}0D`, border: `1px solid ${emerald[600]}26` }}>EcoTrack Community (Live)</span>
          </div>
        </motion.section>

        {/* ═══ LIVE OVERVIEW CARDS ═════════════════════════════════════════════ */}
        <section id="community-overview">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5" style={{ color: emerald[600] }} />
            <h2 className="text-xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>Live Platform Analytics</h2>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ color: emerald[700], background: `${emerald[600]}12`, border: `1px solid ${emerald[600]}30` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: emerald[600] }} />
              Real-time
            </span>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                {/* Registered Users */}
                <motion.div variants={fadeUp} className="p-5 rounded-2xl transition-all duration-300" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${semantic.info}1A`, color: semantic.info }}>
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: surface.textSecondary }}>Users</span>
                  </div>
                  {stats && stats.totalUsers > 0 ? (
                    <p className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>{stats.totalUsers.toLocaleString()}</p>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: surface.textSecondary }}>—</p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: surface.textSecondary }}>Registered accounts</p>
                </motion.div>

                {/* Reports Generated */}
                <motion.div variants={fadeUp} className="p-5 rounded-2xl transition-all duration-300" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${water.sky}1A`, color: water.sky }}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: surface.textSecondary }}>Reports</span>
                  </div>
                  {stats && stats.totalReports > 0 ? (
                    <p className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>{stats.totalReports.toLocaleString()}</p>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: surface.textSecondary }}>—</p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: surface.textSecondary }}>Calculations submitted</p>
                </motion.div>

                {/* Total CO₂ Tracked */}
                <motion.div variants={fadeUp} className="p-5 rounded-2xl transition-all duration-300" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${emerald[600]}12`, color: emerald[600] }}>
                      <Wind className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: surface.textSecondary }}>CO₂ Tracked</span>
                  </div>
                  {stats && stats.totalCO2Tracked > 0 ? (
                    <p className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
                      {formatCO2(stats.totalCO2Tracked)}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: surface.textSecondary }}>—</p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: surface.textSecondary }}>Total community footprint</p>
                </motion.div>

                {/* Average Annual CO₂ */}
                <motion.div variants={fadeUp} className="p-5 rounded-2xl transition-all duration-300" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${solar.amber}1A`, color: solar.amber }}>
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: surface.textSecondary }}>Avg CO₂</span>
                  </div>
                  {stats && stats.averageAnnualCO2 > 0 ? (
                    <p className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
                      {stats.averageAnnualCO2.toFixed(2)}<span className="text-xs ml-1" style={{ color: surface.textSecondary }}>t/yr</span>
                    </p>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: surface.textSecondary }}>—</p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: surface.textSecondary }}>Average annual footprint</p>
                </motion.div>

                {/* Average Eco Score */}
                <motion.div variants={fadeUp} className="p-5 rounded-2xl transition-all duration-300" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${emerald[600]}12`, color: emerald[600] }}>
                      <Leaf className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: surface.textSecondary }}>Eco Score</span>
                  </div>
                  {stats && stats.averageEcoScore > 0 ? (
                    <p className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
                      {stats.averageEcoScore.toFixed(1)}<span className="text-xs ml-1" style={{ color: surface.textSecondary }}>/100</span>
                    </p>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: surface.textSecondary }}>—</p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: surface.textSecondary }}>Community average score</p>
                </motion.div>
              </>
            )}
          </motion.div>
        </section>

        {/* ═══ SEI HISTORICAL SURVEY SECTION ══════════════════════════════════ */}
        <section id="sei-survey">
          <div className="p-6 sm:p-8 rounded-3xl" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-accent-500/10 border border-primary-200 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="t-display-md">SEI Community Survey Dataset</h2>
                  <p className="text-xs text-dark-500">50+ participants · 10 detailed case studies · Internal Community Research</p>
                </div>
              </div>
              <span className="ml-auto text-xs text-primary-600 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full whitespace-nowrap">
                Historical Data
              </span>
            </div>

            {/* SEI Key Survey Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Petrol Users', value: `${seiSurvey.petrolUsers}%`, color: 'text-red-600' },
                { label: 'No Waste Segregation', value: `${seiSurvey.noWasteSegregation}%`, color: 'text-orange-600' },
                { label: 'Low CO₂ Awareness', value: `${seiSurvey.lowCarbonAwareness}%`, color: 'text-amber-600' },
                { label: 'Would Use EcoTrack', value: `${seiSurvey.willingToUseEcoTrack}%`, color: 'text-primary-600' },
                { label: 'Non-Vegetarian', value: `${seiSurvey.nonVegetarian}%`, color: 'text-emerald-600' },
                { label: 'No Composting', value: `${seiSurvey.noComposting}%`, color: 'text-violet-600' },
              ].map((s) => (
                <div key={s.label} className="bg-surface border border-border rounded-xl p-3 text-center">
                  <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-dark-500 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* SEI Derived Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total CO₂ Analysed', value: `${seiMetrics.totalAnnualCO2} t` },
                { label: 'Average Annual CO₂', value: `${seiMetrics.averageAnnualCO2} t` },
                { label: 'Average Eco Score', value: `${seiMetrics.averageEcoScore}` },
                { label: 'Best: Vegan Student', value: `${seiMetrics.highestEcoScore}/100` },
              ].map((m) => (
                <div key={m.label} className="bg-surface border border-border rounded-xl p-3">
                  <p className="text-xl font-display font-bold gradient-text">{m.value}</p>
                  <p className="text-[10px] text-dark-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CHARTS ROW ══════════════════════════════════════════════════════ */}
        <section id="community-charts">
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h2 className="t-display-md">Emission Analytics</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* SEI Emission Distribution Doughnut */}
            <div className="p-5 flex flex-col h-[340px] rounded-2xl" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-text-primary">SEI Emission Distribution</h3>
                <p className="text-[11px] text-dark-500 mt-0.5">Community survey emission share by category</p>
              </div>
              <div className="flex-1 relative min-h-0">
                <Doughnut data={seiDoughnutData} options={doughnutOptions} />
              </div>
            </div>

            {/* Live Community Breakdown */}
            <div className="p-5 flex flex-col h-[340px] rounded-2xl" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Live Community Breakdown</h3>
                <p className="text-[11px] text-dark-500 mt-0.5">Aggregated live footprint by category (kg CO₂)</p>
              </div>
              <div className="flex-1 relative min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                  </div>
                ) : liveBreakdownData && (stats?.totalCO2Tracked ?? 0) > 0 ? (
                  <Doughnut data={liveBreakdownData} options={doughnutOptions} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Wind className="w-8 h-8 text-dark-500" />
                    <p className="text-sm text-dark-500 text-center">
                      Data will appear as users generate reports.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SEI Case Studies Bar */}
            <div className="p-5 flex flex-col h-[340px] rounded-2xl" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-text-primary">SEI Case Studies</h3>
                <p className="text-[11px] text-dark-500 mt-0.5">Annual CO₂ per profile (tons/year)</p>
              </div>
              <div className="flex-1 relative min-h-0">
                <Bar data={seiBarData} options={{
                  ...barOptions,
                  scales: {
                    ...barOptions.scales,
                    x: { ...barOptions.scales.x, ticks: { ...darkTicks, maxRotation: 45 } },
                  },
                }} />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ USER LEADERBOARD ════════════════════════════════════════════════ */}
        <section id="community-leaderboard">
          <div className="p-5 sm:p-6 flex flex-col max-w-3xl mx-auto rounded-2xl" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-display font-bold" style={{ color: surface.textPrimary }}>User Leaderboard</h2>
              </div>
              <span className="text-xs text-dark-500">Top eco scores</span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10 gap-3">
                <Trophy className="w-10 h-10 text-dark-500" />
                <p className="text-sm text-dark-500 text-center">
                  Be the first EcoTrack user to generate a report and claim the top spot!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleLeaderboard.map((entry, i) => {
                  const isCurrentUser = user && entry.userId === user.uid;
                  return (
                    <MemoizedLeaderboardEntry 
                      key={`${entry.displayName}-${leaderboardPageStart + i}`}
                      entry={entry}
                      index={leaderboardPageStart + i}
                      isCurrentUser={!!isCurrentUser}
                    />
                  );
                })}
                {totalLeaderboardPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border mt-3 pt-3">
                    <span className="text-xs text-dark-500">
                      Page {leaderboardPage + 1} of {totalLeaderboardPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLeaderboardPage((page) => Math.max(0, page - 1))}
                        disabled={leaderboardPage === 0}
                        title="Previous leaderboard page"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border text-dark-500 hover:text-text-primary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaderboardPage((page) => Math.min(totalLeaderboardPages - 1, page + 1))}
                        disabled={leaderboardPage >= totalLeaderboardPages - 1}
                        title="Next leaderboard page"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border text-dark-500 hover:text-text-primary hover:bg-surface disabled:opacity-40 disabled:pointer-events-none transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* My Contribution Card */}
            {userEntry && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold mb-4" style={{ color: surface.textPrimary }}>My Contribution</h3>
                <MemoizedLeaderboardEntry 
                  entry={userEntry}
                  index={userRankIndex}
                  isCurrentUser={true}
                  isContributionCard={true}
                />
                
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface border border-border p-4 rounded-xl">
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: surface.textPrimary }}>Anonymous Ranking</h4>
                    <p className="text-xs text-dark-500 mt-0.5">Hide your display name from the public leaderboard</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={userEntry.isAnonymous}
                      onChange={(e) => handleToggleAnonymous(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-dark-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══ COMMUNITY INSIGHTS ══════════════════════════════════════════════ */}
        <section id="community-insights">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h2 className="t-display-md">Community Insights</h2>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {insights.map((insight) => (
              <motion.div
                key={insight.id}
                variants={fadeUp}
                className="p-5 group rounded-2xl transition-all duration-300"
                style={{ background: surface.panel, border: `1px solid ${surface.border}` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{insight.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        insight.source === 'sei'
                          ? 'text-primary-700 bg-primary-50 border border-primary-200'
                          : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      }`}>
                        {insight.source === 'sei' ? 'SEI Survey' : 'Live Data'}
                      </span>
                    </div>
                    <p className="text-sm text-dark-700 leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Always-visible loading insight when live data isn't ready */}
            {loading && (
              <motion.div variants={fadeUp} className="p-5 rounded-2xl animate-pulse" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-dark-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-2 bg-dark-100 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-dark-100 rounded w-full mb-2" />
                    <div className="h-3 bg-dark-100 rounded w-4/5" />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ═══ FOOTER NOTE ═════════════════════════════════════════════════════ */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-dark-500">
            Community analytics update in real-time via Firestore listeners.
            Historical data sourced from the EcoTrack SEI Survey (50+ participants, 2026).
            All leaderboard entries are privacy-safe — no emails or UIDs are ever displayed.
          </p>
        </div>

      </div>
    </div>
  );
}
