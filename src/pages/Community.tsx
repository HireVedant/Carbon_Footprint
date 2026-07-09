import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
import { useCommunityStats } from '../hooks/useCommunityStats';
import {
  getSEIEmissionChartData,
  getSEICaseStudyChartData,
  getSEISurveyStats,
  getSEIDerivedMetrics,
} from '../services/seiDatasetService';

// ── Chart.js registration ─────────────────────────────────────────────────────
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ── Shared chart options ──────────────────────────────────────────────────────
const darkTooltip = {
  backgroundColor: '#1e293b',
  titleColor: '#ffffff',
  bodyColor: '#e2e8f0',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
  usePointStyle: true,
};

const darkTicks = { color: '#64748b', font: { family: 'Inter', size: 10 } };
const darkGrid  = { color: 'rgba(255,255,255,0.03)' };

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 14, usePointStyle: true },
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
  if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 70) return 'text-green-400 bg-green-500/10 border-green-500/30';
  if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (score >= 30) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  return 'text-red-400 bg-red-500/10 border-red-500/30';
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
    <div className="glass p-5 animate-pulse">
      <div className="h-3 bg-white/10 rounded w-2/3 mb-4" />
      <div className="h-8 bg-white/10 rounded w-1/2 mb-2" />
      <div className="h-2 bg-white/5 rounded w-3/4" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-3 animate-pulse">
      <div className="w-6 h-6 bg-white/10 rounded-full flex-shrink-0" />
      <div className="flex-1 h-3 bg-white/10 rounded" />
      <div className="w-14 h-3 bg-white/10 rounded" />
      <div className="w-14 h-3 bg-white/10 rounded" />
    </div>
  );
}

// ── Rank medal helper ─────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-dark-400">
      {rank}
    </span>
  );
}

// ── Format CO₂ helper ─────────────────────────────────────────────────────────
function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${Math.round(kg)} kg`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Community Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Community() {
  const { stats, leaderboard, insights, loading, error } = useCommunityStats();
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
      setLeaderboardPage(totalLeaderboardPages - 1);
    }
  }, [leaderboardPage, totalLeaderboardPages]);

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
        <div className="glass-strong p-12 rounded-3xl text-center max-w-md mx-auto relative z-10">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-dark-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">

        {/* ═══ HERO HEADER ═════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto pt-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-5">
            <Globe2 className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">Community Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
            Our Collective <span className="gradient-text">Carbon Impact</span>
          </h1>
          <p className="text-dark-400 text-base sm:text-lg leading-relaxed">
            Real-time community analytics powered by live Firestore data and validated by our
            SEI survey of 50+ participants. Updated instantly as new reports come in.
          </p>
        </motion.div>

        {/* ═══ LIVE OVERVIEW CARDS ═════════════════════════════════════════════ */}
        <section id="community-overview">
          <div className="flex items-center gap-3 mb-5">
            <Activity className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-display font-bold text-white">Live Platform Analytics</h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
                <motion.div variants={fadeUp} className="glass p-5 group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Users</span>
                  </div>
                  {stats && stats.totalUsers > 0 ? (
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                  ) : (
                    <p className="text-2xl font-display font-bold text-dark-500">—</p>
                  )}
                  <p className="text-[11px] text-dark-500 mt-1">Registered accounts</p>
                </motion.div>

                {/* Reports Generated */}
                <motion.div variants={fadeUp} className="glass p-5 group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Reports</span>
                  </div>
                  {stats && stats.totalReports > 0 ? (
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white">{stats.totalReports.toLocaleString()}</p>
                  ) : (
                    <p className="text-2xl font-display font-bold text-dark-500">—</p>
                  )}
                  <p className="text-[11px] text-dark-500 mt-1">Calculations submitted</p>
                </motion.div>

                {/* Total CO₂ Tracked */}
                <motion.div variants={fadeUp} className="glass p-5 group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                      <Wind className="w-4 h-4 text-primary-400" />
                    </div>
                    <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">CO₂ Tracked</span>
                  </div>
                  {stats && stats.totalCO2Tracked > 0 ? (
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white">
                      {formatCO2(stats.totalCO2Tracked)}
                    </p>
                  ) : (
                    <p className="text-2xl font-display font-bold text-dark-500">—</p>
                  )}
                  <p className="text-[11px] text-dark-500 mt-1">Total community footprint</p>
                </motion.div>

                {/* Average Annual CO₂ */}
                <motion.div variants={fadeUp} className="glass p-5 group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Avg CO₂</span>
                  </div>
                  {stats && stats.averageAnnualCO2 > 0 ? (
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white">
                      {stats.averageAnnualCO2.toFixed(2)}<span className="text-xs text-dark-400 ml-1">t/yr</span>
                    </p>
                  ) : (
                    <p className="text-2xl font-display font-bold text-dark-500">—</p>
                  )}
                  <p className="text-[11px] text-dark-500 mt-1">Average annual footprint</p>
                </motion.div>

                {/* Average Eco Score */}
                <motion.div variants={fadeUp} className="glass p-5 group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Eco Score</span>
                  </div>
                  {stats && stats.averageEcoScore > 0 ? (
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white">
                      {stats.averageEcoScore.toFixed(1)}<span className="text-xs text-dark-400 ml-1">/100</span>
                    </p>
                  ) : (
                    <p className="text-2xl font-display font-bold text-dark-500">—</p>
                  )}
                  <p className="text-[11px] text-dark-500 mt-1">Community average score</p>
                </motion.div>
              </>
            )}
          </motion.div>
        </section>

        {/* ═══ SEI HISTORICAL SURVEY SECTION ══════════════════════════════════ */}
        <section id="sei-survey">
          <div className="glass-strong p-6 sm:p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-primary-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">SEI Community Survey Dataset</h2>
                  <p className="text-xs text-dark-400">50+ participants · 10 detailed case studies · Software Engineering Mini Project 2026</p>
                </div>
              </div>
              <span className="ml-auto text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full whitespace-nowrap">
                Historical Data
              </span>
            </div>

            {/* SEI Key Survey Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Petrol Users', value: `${seiSurvey.petrolUsers}%`, color: 'text-red-400' },
                { label: 'No Waste Segregation', value: `${seiSurvey.noWasteSegregation}%`, color: 'text-orange-400' },
                { label: 'Low CO₂ Awareness', value: `${seiSurvey.lowCarbonAwareness}%`, color: 'text-amber-400' },
                { label: 'Would Use EcoTrack', value: `${seiSurvey.willingToUseEcoTrack}%`, color: 'text-primary-400' },
                { label: 'Non-Vegetarian', value: `${seiSurvey.nonVegetarian}%`, color: 'text-emerald-400' },
                { label: 'No Composting', value: `${seiSurvey.noComposting}%`, color: 'text-violet-400' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-dark-400 mt-1 leading-tight">{s.label}</p>
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
                <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xl font-display font-bold gradient-text">{m.value}</p>
                  <p className="text-[10px] text-dark-400 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CHARTS ROW ══════════════════════════════════════════════════════ */}
        <section id="community-charts">
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-display font-bold text-white">Emission Analytics</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* SEI Emission Distribution Doughnut */}
            <div className="glass p-5 flex flex-col h-[340px]">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">SEI Emission Distribution</h3>
                <p className="text-[11px] text-dark-500 mt-0.5">Community survey emission share by category</p>
              </div>
              <div className="flex-1 relative min-h-0">
                <Doughnut data={seiDoughnutData} options={doughnutOptions} />
              </div>
            </div>

            {/* Live Community Breakdown */}
            <div className="glass p-5 flex flex-col h-[340px]">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">Live Community Breakdown</h3>
                <p className="text-[11px] text-dark-500 mt-0.5">Aggregated live footprint by category (kg CO₂)</p>
              </div>
              <div className="flex-1 relative min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
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
            <div className="glass p-5 flex flex-col h-[340px]">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">SEI Case Studies</h3>
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
          <div className="glass p-5 sm:p-6 flex flex-col max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-display font-bold text-white">User Leaderboard</h2>
              </div>
              <span className="text-xs text-dark-500">Top eco scores</span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10 gap-3">
                <Trophy className="w-10 h-10 text-dark-600" />
                <p className="text-sm text-dark-500 text-center">
                  Be the first EcoTrack user to generate a report and claim the top spot!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleLeaderboard.map((entry, i) => (
                  <motion.div
                    key={`${entry.displayName}-${leaderboardPageStart + i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200"
                  >
                    <RankBadge rank={leaderboardPageStart + i + 1} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{entry.displayName}</p>
                      <div className="flex items-center gap-1 text-[10px] text-dark-500 mt-0.5">
                        {categoryIcon(entry.highestCategory)}
                        <span>{entry.highestCategory}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">{entry.annualEstimate} t</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ecoScoreColor(entry.ecoScore)}`}>
                        {entry.ecoLabel}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/10 flex-shrink-0">
                      <span className="text-sm font-display font-bold gradient-text">{entry.ecoScore}</span>
                    </div>
                  </motion.div>
                ))}
                {totalLeaderboardPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 mt-3 pt-3">
                    <span className="text-xs text-dark-500">
                      Page {leaderboardPage + 1} of {totalLeaderboardPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLeaderboardPage((page) => Math.max(0, page - 1))}
                        disabled={leaderboardPage === 0}
                        title="Previous leaderboard page"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-white/10 text-dark-300 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaderboardPage((page) => Math.min(totalLeaderboardPages - 1, page + 1))}
                        disabled={leaderboardPage >= totalLeaderboardPages - 1}
                        title="Next leaderboard page"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-white/10 text-dark-300 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ═══ COMMUNITY INSIGHTS ══════════════════════════════════════════════ */}
        <section id="community-insights">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-display font-bold text-white">Community Insights</h2>
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
                className="glass p-5 group hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{insight.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        insight.source === 'sei'
                          ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      }`}>
                        {insight.source === 'sei' ? 'SEI Survey' : 'Live Data'}
                      </span>
                    </div>
                    <p className="text-sm text-dark-300 leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Always-visible loading insight when live data isn't ready */}
            {loading && (
              <motion.div variants={fadeUp} className="glass p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-2 bg-white/10 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-white/10 rounded w-full mb-2" />
                    <div className="h-3 bg-white/10 rounded w-4/5" />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ═══ FOOTER NOTE ═════════════════════════════════════════════════════ */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-dark-600">
            Community analytics update in real-time via Firestore listeners.
            Historical data sourced from the EcoTrack SEI Survey (50+ participants, 2026).
            All leaderboard entries are privacy-safe — no emails or UIDs are ever displayed.
          </p>
        </div>

      </div>
    </div>
  );
}
