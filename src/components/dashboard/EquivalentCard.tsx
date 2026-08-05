/**
 * EcoTrack AI — Equivalent Card Component
 *
 * Displays Indian-contextual environmental equivalents dynamically computed
 * from the EnvironmentalEquivalentProvider. Each equivalence is sourced from
 * government datasets (MoPNG, CEA, ARAI, FSI, ICAR, MNRE, DMRC, MSRTC).
 *
 * Zero hardcoded environmental values — all data flows through the provider layer.
 *
 * @module components/dashboard/EquivalentCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Zap,
  Train,
  Fuel,
  Plane,
  Car,
  Bus,
  TreePine,
  Wheat,
  Sun,
} from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';
import { EnvironmentalEquivalentProvider } from '../../data/providers';
import { emerald, surface } from '../../design/colors';

/** Map of icon name strings to lucide-react icon components. */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Zap,
  Train,
  Fuel,
  Plane,
  Car,
  Bus,
  TreePine,
  Wheat,
  Sun,
};

interface EquivalentCardProps {
  results: CalculationResult;
}

export const EquivalentCard: React.FC<EquivalentCardProps> = ({ results }) => {
  const { totalEmissions } = results;

  // Compute all Indian environmental equivalents from the provider
  const { data: equivalentsSet, metadata } = EnvironmentalEquivalentProvider.computeEquivalents(totalEmissions);
  const equivalents = equivalentsSet.equivalents;

  return (
    <div className="glass-eco p-6 rounded-3xl hover:border-primary-200 transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="w-5 h-5" style={{ color: emerald[600] }} />
          <h3 className="text-sm font-semibold" style={{ color: surface.textPrimary }}>Environmental Equivalents</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {equivalents.slice(0, 8).map((eq, i) => {
            const Icon = ICON_MAP[eq.iconName] || Zap;
            return (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-2xl border flex flex-col justify-between hover:bg-primary-50/60 transition-all duration-300 ${eq.colorClass}`}
                style={{ borderColor: `${surface.border}40`, background: `${surface.base}30` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: surface.textSecondary }}>{eq.label}</span>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-display font-bold leading-tight" style={{ color: surface.textPrimary }}>
                    {eq.value}
                    <span className="text-[10px] font-normal ml-1 block sm:inline" style={{ color: surface.textSecondary }}>{eq.unit}</span>
                  </p>
                  <p className="text-[9px] mt-1 leading-snug line-clamp-2" style={{ color: surface.textSecondary }}>
                    {eq.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${surface.border}` }}>
        <p className="text-[9px] italic" style={{ color: surface.textSecondary }}>
          Sources: {metadata.source} | {metadata.methodology?.split('.').slice(0, 1)}.
        </p>
      </div>
    </div>
  );
};