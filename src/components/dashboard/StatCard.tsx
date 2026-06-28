import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

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
  iconBgColor = 'bg-primary-500/10',
  iconColor = 'text-primary-400',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass p-5 flex flex-col justify-between group hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300 h-full"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-dark-300 uppercase tracking-wider">{label}</span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            {value}
          </span>
          {unit && <span className="text-xs text-dark-400 font-semibold">{unit}</span>}
        </div>
        <p className="text-[11px] text-dark-500 mt-1 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};
