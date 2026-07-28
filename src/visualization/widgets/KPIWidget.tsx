/**
 * KPI Widget
 *
 * Compact metric panel with current value, trend, sparkline, comparison, and status.
 * Used in dashboard panels to show key performance indicators.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Sparkline } from '../charts/Sparkline';

interface KPIWidgetProps {
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  sparkData?: number[];
  comparison?: string;
  status?: 'good' | 'warning' | 'critical';
  icon?: React.ReactNode;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  label,
  value,
  unit,
  trend,
  trendLabel,
  sparkData,
  comparison,
  status = 'good',
  icon,
}) => {
  const statusColors = {
    good: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    critical: 'border-rose-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass p-4 border ${statusColors[status]} rounded-2xl hover:border-white/15 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-dark-400 font-semibold">{label}</span>
        {icon && <span className="text-dark-500">{icon}</span>}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{value}</span>
            {unit && <span className="text-xs text-dark-400">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${
              trend < 0 ? 'text-emerald-400' : trend > 0 ? 'text-rose-400' : 'text-dark-400'
            }`}>
              {trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              <span>{Math.abs(trend)}% {trendLabel || ''}</span>
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} width={80} height={32} />
        )}
      </div>

      {comparison && (
        <p className="text-[9px] text-dark-500 mt-2 pt-2 border-t border-white/5">{comparison}</p>
      )}
    </motion.div>
  );
};