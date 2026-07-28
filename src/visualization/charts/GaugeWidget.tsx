/**
 * Gauge Widget
 *
 * Circular gauge showing sustainability score.
 * SVG-based with animated fill and glow effects.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface GaugeWidgetProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  size?: number;
  color?: string;
}

export const GaugeWidget: React.FC<GaugeWidgetProps> = ({
  value,
  max = 100,
  label,
  unit = '',
  size = 160,
  color = '#10b981',
}) => {
  const pct = Math.min(1, Math.max(0, value / max));
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);
  const center = size / 2;

  const getColor = (p: number) => {
    if (p >= 0.7) return '#10b981';
    if (p >= 0.4) return '#f59e0b';
    return '#ef4444';
  };
  const fillColor = color === '#10b981' ? getColor(pct) : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={8}
          />
          {/* Animated fill */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={fillColor}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${fillColor}66)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-white">{value}</p>
            {unit && <p className="text-[9px] text-dark-400">{unit}</p>}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-dark-300 font-semibold uppercase tracking-wider text-center">{label}</p>
    </div>
  );
};