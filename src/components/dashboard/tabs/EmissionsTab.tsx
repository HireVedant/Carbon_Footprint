/**
 * Emissions Tab — Dashboard
 *
 * Shows: Radar chart, Doughnut chart, Category contribution bars, Stacked bar chart.
 * All data is pre-computed by Dashboard.tsx and passed as props.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, PieChart, BarChart3 } from 'lucide-react';
import { PremiumRadarChart, PremiumDoughnut, TrendChart } from '../../../visualization';

interface BreakdownShape {
  transport: number;
  energy: number;
  food: number;
  waste: number;
  shopping: number;
}

interface EmissionsTabProps {
  radarData: any;
  doughnutData: any;
  categoryChartData: any;
  breakdown: BreakdownShape;
  totalKg: number;
  totalTonnes: number;
  indiaAvgKg: number;
}

export const EmissionsTab: React.FC<EmissionsTabProps> = ({
  radarData,
  doughnutData,
  categoryChartData,
  breakdown,
  totalKg,
  totalTonnes,
  indiaAvgKg,
}) => {
  const categories = [
    { label: 'Transport', value: Math.round(breakdown.transport || 0), color: 'var(--data-transport)', icon: '🚗' },
    { label: 'Energy',    value: Math.round(breakdown.energy    || 0), color: 'var(--data-energy)',    icon: '⚡' },
    { label: 'Food',      value: Math.round(breakdown.food      || 0), color: 'var(--data-food)',      icon: '🌾' },
    { label: 'Waste',     value: Math.round(breakdown.waste     || 0), color: '#a78bfa',               icon: '♻️' },
    { label: 'Shopping',  value: Math.round(breakdown.shopping  || 0), color: '#6366f1',               icon: '🛍️' },
  ];

  const maxVal = Math.max(...categories.map(c => c.value), 1);

  return (
    <div className="space-y-6">
      {/* ── Radar + Doughnut ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="surface-elevated p-6 rounded-3xl" style={{ minHeight: '360px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Emission Profile</h3>
                <p className="text-[10px] text-[var(--text-muted)]">
                  What contributes most to your footprint?
                </p>
              </div>
            </div>
            <PremiumRadarChart data={radarData} height={280} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="surface-elevated p-6 rounded-3xl" style={{ minHeight: '360px' }}>
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Emission Breakdown</h3>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Composition of your carbon footprint
                </p>
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
      </div>

      {/* ── Category Contribution Bars + Stacked Bar Chart ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="surface-elevated p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3
                className="w-4 h-4"
                style={{ color: 'var(--color-primary)' }}
              />
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Category Contribution
                </h3>
                <p
                  className="text-[10px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Where your emissions come from (kg CO₂e)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map(cat => {
                const pct = Math.round((cat.value / maxVal) * 100);
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-medium flex items-center gap-1.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span>{cat.icon}</span> {cat.label}
                      </span>
                      <span
                        className="text-[11px] font-bold tabular-nums"
                        style={{ color: cat.color, fontFamily: 'var(--font-mono)' }}
                      >
                        {cat.value.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ background: 'var(--bg-primary)' }}
                    >
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

            <div
              className="mt-3 pt-3"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <div
                className="flex justify-between text-[9px]"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>Total: {Math.round(totalKg).toLocaleString()} kg CO₂e</span>
                <span>India avg: {indiaAvgKg.toLocaleString()} kg</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="surface-elevated p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Activity
                className="w-4 h-4"
                style={{ color: 'var(--color-info)' }}
              />
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Category Comparison
                </h3>
                <p
                  className="text-[10px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Emissions breakdown by sector (kg CO₂e)
                </p>
              </div>
            </div>
            <TrendChart type="stacked-bar" data={categoryChartData} height={300} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
