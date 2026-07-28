import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { surface, fontFamily, radius, emerald } from '../../design';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  subtitle: string;
  iconBgColor?: string;
  iconColor?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  subtitle,
  iconBgColor,
  iconColor = emerald[500],
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="p-5 flex flex-col justify-between group transition-all duration-300 h-full"
      style={{
        background: surface.panel,
        border: `1px solid ${surface.border}`,
        borderRadius: radius.xl,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = surface.textSecondary;
        e.currentTarget.style.background = surface.base;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = surface.border;
        e.currentTarget.style.background = surface.panel;
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{
            background: iconBgColor || `${emerald[500]}14`,
            border: `1px solid ${emerald[500]}26`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: surface.textSecondary, fontFamily: fontFamily.body }}>
          {label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
            {value}
          </span>
          {unit && <span className="text-xs font-semibold" style={{ color: surface.textSecondary }}>{unit}</span>}
        </div>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: surface.textSecondary }}>
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};
