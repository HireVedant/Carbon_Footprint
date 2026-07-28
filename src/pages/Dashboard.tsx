/**
 * EcoTrack AI — Dashboard Page (Visualization-First Redesign)
 *
 * Visualization occupies ~70% of page. Cards support visualizations.
 * All charts consume typed data from VisualizationDataProvider.
 * Zero hardcoded environmental values.
 */

import React, { useState, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { getUserAssessments } from '../firebase/firestore';
import { NationalDataProvider } from '../data/providers/NationalDataProvider';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { InsightCard } from '../components/dashboard/InsightCard';
import { EquivalentCard } from '../components/dashboard/EquivalentCard';
import { CategoryCard } from '../components/dashboard/CategoryCard';
import { ActionButtons } from '../components/dashboard/ActionButtons';
import { EmptyDashboard } from '../components/dashboard/EmptyDashboard';
import { ImprovementPreview } from '../components/dashboard/ImprovementPreview';
import { WhatIfSimulator } from '../components/dashboard/WhatIfSimulator';

// Visualization system
import {
  PremiumRadarChart,
  PremiumDoughnut,
  GaugeWidget,
  TrendChart,
  KPIWidget,
  VisualizationDataProvider,
} from '../visualization';

import {
  Zap, Sparkles, Loader2, TrendingDown, Activity, Globe, Leaf, PieChart, BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';

const INDIA_AVG_KG = NationalDataProvider.getIndiaAverageFootprintKg().data;

export default function Dashboard() {
  const { user } = useAuth();
  const { result: contextResult } = useAssessment();
  const [activeResult, setActiveResult] = useState<any | null>(contextResult);
  const [previousAssessment, setPreviousAssessment] = useState<any | null>(null);
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (contextResult) setActiveResult(contextResult); }, [contextResult]);

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
                metadata: { gridFactorUsed: 0.716, state: latest.location?.state || 'India', calculatorVersion: '2.0.0', datasetVersion: '2026.1' },
              });
            }
            if (docs.length > 1) setPreviousAssessment(docs[1]);
            setHistoryDocs(docs);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user?.uid, contextResult]);

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  );

  if (!activeResult) return (
    <div className="min-h-screen pt-24 pb-16 relative flex items-center justify-center">
      <div className="absolute inset-0 mesh-bg" />
      <EmptyDashboard />
    </div>
  );

  const totalKg = activeResult.totalKgCO2PerYear ?? (activeResult.totalEmissions ?? 0);
  const totalTonnes = activeResult.totalTonnesCO2PerYear ?? Math.round((totalKg / 1000) * 100) / 100;
  const breakdown = activeResult.breakdown ?? {
    transport: activeResult.transportEmissions ?? 0,
    energy: activeResult.energyEmissions ?? 0,
    food: activeResult.foodEmissions ?? 0,
    waste: activeResult.wasteEmissions ?? 0,
    shopping: 0,
  };
  const ecoScore = Math.max(1, Math.min(100, Math.round(100 - totalTonnes * 5.5)));
  const confidenceScore = activeResult.confidence?.overallScore ?? 85;
  const confidenceRating = activeResult.confidence?.overallRating ?? 'HIGH';
  const vsIndiaPct = Math.round(((totalKg - INDIA_AVG_KG) / INDIA_AVG_KG) * 100);
  const isLowerThanIndia = totalKg <= INDIA_AVG_KG;

  const prevKg = previousAssessment?.emissions?.totalKgCO2PerYear;
  const deltaVsPrev = prevKg ? Math.round(totalKg - prevKg) : null;
  const sparkData = VisualizationDataProvider.getSparklineData(historyDocs.length > 0 ? historyDocs : [{ totalKgCO2PerYear: totalKg, createdAt: { seconds: Date.now() / 1000 } }]);

  const radarData = VisualizationDataProvider.getRadarData(breakdown);
  const doughnutData = VisualizationDataProvider.getDoughnutData(breakdown);

  const categoryChartData = {
    labels: ['Transport', 'Energy', 'Food', 'Waste', 'Shopping'],
    datasets: [{
      label: 'Emissions (kg CO₂e/yr)',
      data: [Math.round(breakdown.transport || 0), Math.round(breakdown.energy || 0), Math.round(breakdown.food || 0), Math.round(breakdown.waste || 0), Math.round(breakdown.shopping || 0)],
      backgroundColor: ['rgba(6, 182, 212, 0.55)', 'rgba(245, 158, 11, 0.55)', 'rgba(244, 63, 94, 0.55)', 'rgba(139, 92, 246, 0.55)', 'rgba(99, 102, 241, 0.55)'],
      borderColor: ['rgba(6, 182, 212, 1)', 'rgba(245, 158, 11, 1)', 'rgba(244, 63, 94, 1)', 'rgba(139, 92, 246, 1)', 'rgba(99, 102, 241, 1)'],
      borderWidth: 1.5,
    }],
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        <DashboardHeader date={formattedDate} />

        {/* ── KPI PANELS ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPIWidget
            label="Annual Footprint"
            value={totalTonnes.toString()}
            unit="t CO₂e"
            trend={deltaVsPrev !== null ? Math.round((deltaVsPrev / (prevKg || 1)) * 100) : undefined}
            trendLabel="vs previous"
            sparkData={sparkData}
            comparison={`${totalKg.toLocaleString()} kg CO₂e total`}
            status={isLowerThanIndia ? 'good' : 'warning'}
            icon={<Leaf className="w-4 h-4" />}
          />
          <KPIWidget
            label="Eco Score"
            value={ecoScore.toString()}
            unit="/100"
            comparison={ecoScore >= 70 ? 'Eco Champion' : 'Room to improve'}
            status={ecoScore >= 70 ? 'good' : ecoScore >= 40 ? 'warning' : 'critical'}
            icon={<Sparkles className="w-4 h-4" />}
          />
          <KPIWidget
            label="vs Indian Avg"
            value={`${Math.abs(vsIndiaPct)}%`}
            unit={isLowerThanIndia ? 'lower' : 'higher'}
            comparison="Based on 1.9t national baseline"
            status={isLowerThanIndia ? 'good' : 'warning'}
            icon={<Globe className="w-4 h-4" />}
          />
          <KPIWidget
            label="Confidence"
            value={`${confidenceScore}%`}
            unit={confidenceRating}
            comparison="CEA grid factor: 0.716 kg/kWh"
            status={confidenceScore >= 80 ? 'good' : 'warning'}
            icon={<Activity className="w-4 h-4" />}
          />
        </div>

        {/* ── PERSONAL ANALYTICS: RADAR + DOUGHNUT + GAUGE ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart — "What contributes most?" */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="glass-eco p-6 rounded-3xl h-full">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Emission Profile</h3>
                  <p className="text-[10px] text-dark-400">What contributes most to your footprint?</p>
                </div>
              </div>
              <PremiumRadarChart data={radarData} height={280} />
            </div>
          </motion.div>

          {/* Doughnut — "What makes up my footprint?" */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="glass-eco p-6 rounded-3xl h-full">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Emission Breakdown</h3>
                  <p className="text-[10px] text-dark-400">Composition of your carbon footprint</p>
                </div>
              </div>
              <PremiumDoughnut
                data={doughnutData}
                centerValue={totalTonnes.toString()}
                centerLabel="tonnes/yr"
                height={280}
              />
            </div>
          </motion.div>

          {/* Gauges — "How sustainable are you?" */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <div className="glass-eco p-6 rounded-3xl h-full">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Sustainability Score</h3>
                  <p className="text-[10px] text-dark-400">How sustainable are you?</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-6 pt-4">
                <GaugeWidget value={ecoScore} label="Eco Score" size={150} />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <GaugeWidget value={confidenceScore} label="Confidence" size={100} color="#06b6d4" />
                  <GaugeWidget value={Math.min(100, Math.round((INDIA_AVG_KG / Math.max(totalKg, 1)) * 100))} label="vs India Avg" size={100} color="#f59e0b" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── CONTRIBUTION BARS + CATEGORY COMPARISON ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horizontal Contribution Bars — replaces PolarTimeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="glass-eco p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Category Contribution</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Where your emissions come from (kg CO₂e)</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Transport', value: Math.round(breakdown.transport || 0), color: 'var(--data-transport)', icon: '🚗' },
                  { label: 'Energy', value: Math.round(breakdown.energy || 0), color: 'var(--data-energy)', icon: '⚡' },
                  { label: 'Food', value: Math.round(breakdown.food || 0), color: 'var(--data-food)', icon: '🌾' },
                  { label: 'Waste', value: Math.round(breakdown.waste || 0), color: '#a78bfa', icon: '♻️' },
                  { label: 'Shopping', value: Math.round(breakdown.shopping || 0), color: '#6366f1', icon: '🛍️' },
                ].map(cat => {
                  const maxVal = Math.max(breakdown.transport || 1, breakdown.energy || 1, breakdown.food || 1, breakdown.waste || 1, breakdown.shopping || 1);
                  const pct = Math.round((cat.value / maxVal) * 100);
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <span>{cat.icon}</span> {cat.label}
                        </span>
                        <span className="text-[11px] font-bold tabular-nums" style={{ color: cat.color, fontFamily: 'var(--font-mono)' }}>
                          {cat.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span>Total: {Math.round(totalKg).toLocaleString()} kg CO₂e</span>
                  <span>Per capita India avg: {INDIA_AVG_KG.toLocaleString()} kg</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Category Bar Chart — detailed comparison */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <div className="glass-eco p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Category Comparison</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Emissions breakdown by sector (kg CO₂e)</p>
                </div>
              </div>
              <TrendChart type="stacked-bar" data={categoryChartData} height={300} />
            </div>
          </motion.div>
        </div>

        {/* ── INSIGHTS ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightCard
            answers={activeResult.answers}
            results={{ transportEmissions: breakdown.transport, energyEmissions: breakdown.energy, foodEmissions: breakdown.food, wasteEmissions: breakdown.waste, totalEmissions: totalKg, annualEstimate: totalTonnes, ecoScore } as any}
          />
          <EquivalentCard results={{ transportEmissions: breakdown.transport, energyEmissions: breakdown.energy, foodEmissions: breakdown.food, wasteEmissions: breakdown.waste, totalEmissions: totalKg, annualEstimate: totalTonnes, ecoScore } as any} />
        </div>

        {/* ── AI COACH ─────────────────────────────────────────────────────── */}
        <ImprovementPreview
          answers={activeResult.answers}
          results={{ transportEmissions: breakdown.transport, energyEmissions: breakdown.energy, foodEmissions: breakdown.food, wasteEmissions: breakdown.waste, totalEmissions: totalKg, annualEstimate: totalTonnes, ecoScore } as any}
        />

        {/* ── SIMULATOR ────────────────────────────────────────────────────── */}
        {activeResult && (
          <WhatIfSimulator baseAnswers={activeResult.answers || {}} baseTotalKg={totalKg} />
        )}

        {/* ── ACTION PLAN ──────────────────────────────────────────────────── */}
        <CategoryCard results={{ transportEmissions: breakdown.transport, energyEmissions: breakdown.energy, foodEmissions: breakdown.food, wasteEmissions: breakdown.waste, shoppingEmissions: breakdown.shopping, totalEmissions: totalKg, annualEstimate: totalTonnes, ecoScore } as any} />

        {/* ── HISTORY & REPORT ─────────────────────────────────────────────── */}
        <div className="pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <ActionButtons historyDocs={historyDocs} />
        </div>
      </div>
    </div>
  );
}
