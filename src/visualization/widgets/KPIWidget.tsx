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
      className={`glass p-4 border ${statusColors[status]} rounded-2xl hover:border-primary-200 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-dark-500 font-semibold">{label}</span>
        {icon && <span className="text-dark-500">{icon}</span>}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-extrabold text-text-primary">{value}</span>
            {unit && <span className="text-xs text-dark-500">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${
              trend < 0 ? 'text-emerald-700' : trend > 0 ? 'text-rose-700' : 'text-dark-500'
            }`}>
              {trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              <span>{Math.abs(trend)}% {trendLabel || ''}</span>
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <div className="flex-shrink-0">
            <Sparkline data={sparkData} width={80} height={32} />
          </div>
        )}
      </div>

      {comparison && (
        <p className="text-[9px] text-dark-500 mt-2 pt-2 border-t border-border">{comparison}</p>
      )}
    </motion.div>
  );
};