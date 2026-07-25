import React, { useState, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { getUserAssessments } from '../firebase/firestore';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { InsightCard } from '../components/dashboard/InsightCard';
import { EquivalentCard } from '../components/dashboard/EquivalentCard';
import { CategoryCard } from '../components/dashboard/CategoryCard';
import { ActionButtons } from '../components/dashboard/ActionButtons';
import { EmptyDashboard } from '../components/dashboard/EmptyDashboard';
import { EcoScoreBadge } from '../components/dashboard/EcoScoreBadge';
import { ImprovementPreview } from '../components/dashboard/ImprovementPreview';
import { WhatIfSimulator } from '../components/dashboard/WhatIfSimulator';
import {
  Wind, Zap, Calendar, ShieldCheck, TrendingDown,
  Car, Utensils, Trash2, ArrowUpRight, ArrowDownRight,
  Sparkles, CheckCircle2, History as HistoryIcon, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const INDIA_AVG_KG = 2200; // Indian per-capita annual baseline (kg CO2e)

export default function Dashboard() {
  const { user } = useAuth();
  const { result: contextResult } = useAssessment();

  const [activeResult, setActiveResult] = useState<any | null>(contextResult);
  const [previousAssessment, setPreviousAssessment] = useState<any | null>(null);
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contextResult) {
      setActiveResult(contextResult);
    }
  }, [contextResult]);

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      getUserAssessments(user.uid)
        .then(docs => {
          if (docs.length > 0) {
            if (!contextResult) {
              const latest = docs[0];
              setActiveResult({
                totalKgCO2PerYear: latest.emissions?.totalKgCO2PerYear ?? 0,
                totalTonnesCO2PerYear: latest.emissions?.totalTonnesCO2PerYear ?? 0,
                breakdown: latest.emissions?.breakdown ?? { transport: 0, energy: 0, food: 0, waste: 0, shopping: 0 },
                percentages: latest.emissions?.percentages ?? { transport: 20, energy: 40, food: 20, waste: 10, shopping: 10 },
                confidence: latest.confidence ?? { overallScore: 85, overallRating: 'HIGH' },
                metadata: {
                  gridFactorUsed: 0.716,
                  state: latest.location?.state || 'India',
                  calculatorVersion: latest.calculatorVersion || '2.0.0',
                  datasetVersion: latest.datasetVersion || '2026.1',
                }
              });
            }
            if (docs.length > 1) {
              setPreviousAssessment(docs[1]);
            }
            setHistoryDocs(docs);
          }
        })
        .catch(err => console.error('Failed to load user assessments:', err))
        .finally(() => setLoading(false));
    }
  }, [user?.uid, contextResult]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!activeResult) {
    return (
      <div className="min-h-screen pt-24 pb-16 relative flex items-center justify-center">
        <div className="absolute inset-0 mesh-bg" />
        <EmptyDashboard />
      </div>
    );
  }

  const totalKg = activeResult.totalKgCO2PerYear ?? (activeResult.totalEmissions ?? 0);
  const totalTonnes = activeResult.totalTonnesCO2PerYear ?? Math.round((totalKg / 1000) * 100) / 100;
  const breakdown = activeResult.breakdown ?? {
    transport: activeResult.transportEmissions ?? 0,
    energy: activeResult.energyEmissions ?? 0,
    food: activeResult.foodEmissions ?? 0,
    waste: activeResult.wasteEmissions ?? 0,
    shopping: 0,
  };

  // EcoScore: same formula as carbonCalculator.ts (100 - annualTonnes × 5.5, clamped 1–100)
  // This keeps the dashboard score consistent with the v1 calculator and the community leaderboard.
  const ecoScore = Math.max(1, Math.min(100, Math.round(100 - totalTonnes * 5.5)));
  const confidenceScore = activeResult.confidence?.overallScore ?? 85;
  const confidenceRating = activeResult.confidence?.overallRating ?? 'HIGH';

  // Comparison vs Indian Average (2,200 kg CO2e)
  const vsIndiaPct = Math.round(((totalKg - INDIA_AVG_KG) / INDIA_AVG_KG) * 100);
  const isLowerThanIndia = totalKg <= INDIA_AVG_KG;

  // Comparison vs Previous Assessment
  const prevKg = previousAssessment?.emissions?.totalKgCO2PerYear;
  const deltaVsPrev = prevKg ? Math.round(totalKg - prevKg) : null;
  const prevPctChange = (prevKg && deltaVsPrev !== null) ? Math.round((deltaVsPrev / prevKg) * 100) : null;

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const categoryChartData = {
    labels: ['Transport', 'Energy', 'Food', 'Waste', 'Shopping'],
    datasets: [
      {
        label: 'Emissions (kg CO₂e/yr)',
        data: [
          Math.round(breakdown.transport || 0),
          Math.round(breakdown.energy || 0),
          Math.round(breakdown.food || 0),
          Math.round(breakdown.waste || 0),
          Math.round(breakdown.shopping || 0),
        ],
        backgroundColor: [
          'rgba(6, 182, 212, 0.55)',
          'rgba(245, 158, 11, 0.55)',
          'rgba(244, 63, 94, 0.55)',
          'rgba(139, 92, 246, 0.55)',
          'rgba(99, 102, 241, 0.55)',
        ],
        borderColor: [
          'rgba(6, 182, 212, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(99, 102, 241, 1)',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  const trendLabels = historyDocs.length > 0 
    ? historyDocs.map((doc, i) => new Date(doc.createdAt?.toDate?.() || new Date()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })).reverse() 
    : ['Current'];
    
  const trendData = historyDocs.length > 0 
    ? historyDocs.map(doc => Math.round(doc.emissions?.totalKgCO2PerYear ?? 0)).reverse() 
    : [Math.round(totalKg)];

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Total Emissions (kg CO₂e)',
        data: trendData,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const conf = activeResult.confidence;
  const confData = [
    conf?.transport?.score ?? 0,
    conf?.energy?.score ?? 0,
    conf?.food?.score ?? 0,
    conf?.waste?.score ?? 0,
    conf?.shopping?.score ?? 0,
  ];

  const confidenceChartData = {
    labels: ['Transport', 'Energy', 'Food', 'Waste', 'Shopping'],
    datasets: [
      {
        label: 'Confidence Score (%)',
        data: confData,
        backgroundColor: [
          'rgba(6, 182, 212, 0.55)',
          'rgba(245, 158, 11, 0.55)',
          'rgba(244, 63, 94, 0.55)',
          'rgba(139, 92, 246, 0.55)',
          'rgba(99, 102, 241, 0.55)',
        ],
        borderColor: [
          'rgba(6, 182, 212, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(99, 102, 241, 1)',
        ],
        borderWidth: 1.5,
      }
    ]
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        <DashboardHeader date={formattedDate} />

        {/* ── HERO SECTION: ANNUAL FOOTPRINT & METRIC CARDS ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Footprint Card */}
          <div className="lg:col-span-2 bg-gray-900/70 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Annual Carbon Footprint</span>
                <span className="text-xs text-gray-500 font-mono">v2.0 Scientific Engine</span>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-5xl sm:text-6xl font-bold text-white tracking-tight">{totalTonnes}</p>
                <span className="text-xl text-gray-400 font-normal">tonnes CO₂e/yr</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{totalKg.toLocaleString()} kg CO₂e annual total</p>
            </div>

            {/* Benchmarks & Comparisons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800">
              <div className="bg-gray-800/50 p-3 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">vs Indian Average (2.2t)</p>
                <p className={`text-sm font-bold mt-1 flex items-center gap-1 ${isLowerThanIndia ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isLowerThanIndia ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  {Math.abs(vsIndiaPct)}% {isLowerThanIndia ? 'lower' : 'higher'}
                </p>
              </div>

              <div className="bg-gray-800/50 p-3 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">vs Previous Assessment</p>
                {deltaVsPrev !== null ? (
                  <p className={`text-sm font-bold mt-1 flex items-center gap-1 ${deltaVsPrev <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {deltaVsPrev <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    {Math.abs(prevPctChange ?? 0)}% ({deltaVsPrev <= 0 ? '-' : '+'}{Math.abs(deltaVsPrev)} kg)
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">First assessment</p>
                )}
              </div>
            </div>
          </div>

          {/* Eco Score Card */}
          <div className="bg-gray-900/70 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
            <ProgressRing score={ecoScore} />
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Eco Score</p>
              <p className="text-xs text-emerald-400 mt-0.5">{ecoScore >= 70 ? 'Sustainable Lifestyle' : 'Improvement Opportunities Available'}</p>
            </div>
          </div>

          {/* Confidence Card */}
          <div className="bg-gray-900/70 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">Scientific Confidence</span>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-4xl font-bold text-white">{confidenceScore}%</p>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">{confidenceRating}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Based on state-specific grid factors and verified datasets.</p>
            </div>
            <Link to="/history" className="flex items-center justify-between text-xs text-gray-400 hover:text-white pt-3 border-t border-gray-800 transition-colors">
              <span className="flex items-center gap-1.5"><HistoryIcon className="w-3.5 h-3.5" /> View Full History</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* ── 2. INSIGHTS ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightCard
            answers={activeResult.answers}
            results={{
              transportEmissions: breakdown.transport,
              energyEmissions: breakdown.energy,
              foodEmissions: breakdown.food,
              wasteEmissions: breakdown.waste,
              totalEmissions: totalKg,
              annualEstimate: totalTonnes,
              ecoScore
            } as any}
          />
          <EquivalentCard results={{
            transportEmissions: breakdown.transport,
            energyEmissions: breakdown.energy,
            foodEmissions: breakdown.food,
            wasteEmissions: breakdown.waste,
            totalEmissions: totalKg,
            annualEstimate: totalTonnes,
            ecoScore
          } as any} />
        </div>

        {/* ── 3. CHARTS ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            type="bar"
            title="Category Emission Breakdown"
            subtitle="Annual emissions per sector (kg CO₂e)"
            data={categoryChartData}
          />
          <ChartCard
            type="doughnut"
            title="Emission Distribution"
            subtitle="Share of total footprint"
            data={categoryChartData}
          />
          <ChartCard
            type="line"
            title="Historical Trend"
            subtitle={historyDocs.length > 0 ? "Total CO₂e over time" : "Take another assessment to see trends"}
            data={trendChartData}
          />
          <ChartCard
            type="bar"
            title="Confidence Breakdown"
            subtitle="Scientific confidence score per category (%)"
            data={confidenceChartData}
          />
        </div>

        {/* ── 4. AI COACH ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6">
          <ImprovementPreview
            answers={activeResult.answers}
            results={{
              transportEmissions: breakdown.transport,
              energyEmissions: breakdown.energy,
              foodEmissions: breakdown.food,
              wasteEmissions: breakdown.waste,
              totalEmissions: totalKg,
              annualEstimate: totalTonnes,
              ecoScore
            } as any}
          />
        </div>

        {/* ── 5. SIMULATOR ────────────────────────────────────────────────────── */}
        {activeResult && (
          <WhatIfSimulator baseAnswers={activeResult.answers || {}} baseTotalKg={totalKg} />
        )}

        {/* ── 6. ACTION PLAN ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6">
          <CategoryCard results={{
            transportEmissions: breakdown.transport,
            energyEmissions: breakdown.energy,
            foodEmissions: breakdown.food,
            wasteEmissions: breakdown.waste,
            shoppingEmissions: breakdown.shopping,
            totalEmissions: totalKg,
            annualEstimate: totalTonnes,
            ecoScore
          } as any} />
        </div>

        {/* ── 7. HISTORY & REPORT DOWNLOAD ────────────────────────────────────── */}
        <div className="pt-6 border-t border-gray-800">
          <ActionButtons historyDocs={historyDocs} />
        </div>
      </div>
    </div>
  );
}
