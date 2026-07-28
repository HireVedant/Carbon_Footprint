import React from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, Utensils, Trash2, ArrowUpRight } from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';
import { semantic, surface } from '../../design/colors';

interface CategoryCardProps {
  results: CalculationResult;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ results }) => {
  const {
    transportEmissions,
    energyEmissions,
    foodEmissions,
    wasteEmissions,
    totalEmissions,
  } = results;

  const transportTons = parseFloat((transportEmissions / 1000).toFixed(2));
  const energyTons = parseFloat((energyEmissions / 1000).toFixed(2));
  const foodTons = parseFloat((foodEmissions / 1000).toFixed(2));
  const wasteTons = parseFloat((wasteEmissions / 1000).toFixed(2));

  const transportPct = Math.round((transportEmissions / totalEmissions) * 100);
  const energyPct = Math.round((energyEmissions / totalEmissions) * 100);
  const foodPct = Math.round((foodEmissions / totalEmissions) * 100);
  const wastePct = Math.round((wasteEmissions / totalEmissions) * 100);

  const categories = [
    {
      name: 'Transportation',
      value: transportEmissions,
      tons: transportTons,
      pct: transportPct,
      icon: Car,
      color: semantic.transport,
      textColor: semantic.transport,
      glow: `${semantic.transport}20`,
    },
    {
      name: 'Household Energy',
      value: energyEmissions,
      tons: energyTons,
      pct: energyPct,
      icon: Zap,
      color: semantic.energy,
      textColor: semantic.energy,
      glow: `${semantic.energy}20`,
    },
    {
      name: 'Diet & Food Sourcing',
      value: foodEmissions,
      tons: foodTons,
      pct: foodPct,
      icon: Utensils,
      color: semantic.food,
      textColor: semantic.food,
      glow: `${semantic.food}20`,
    },
    {
      name: 'Waste & Shopping',
      value: wasteEmissions,
      tons: wasteTons,
      pct: wastePct,
      icon: Trash2,
      color: semantic.waste,
      textColor: semantic.waste,
      glow: `${semantic.waste}20`,
    },
  ];

  // Determine highest emitting category
  const highestValue = Math.max(...categories.map((c) => c.value));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: surface.textPrimary }}>Carbon Breakdown Details</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: surface.textSecondary }}>Sector Specifics</span>
      </div>

      <div className="space-y-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const isHighest = cat.value === highestValue;

          return (
            <div
              key={cat.name}
              className="p-4 rounded-2xl transition-all duration-300"
              style={{
                background: isHighest ? `${surface.panel}80` : `${surface.base}30`,
                border: isHighest ? `1px solid ${cat.color}40` : `1px solid ${surface.border}40`,
                boxShadow: isHighest ? `0 0 15px ${cat.glow}` : 'none',
                transform: isHighest ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${surface.base}50`, border: `1px solid ${surface.border}40` }}>
                    <Icon className="w-4 h-4" style={{ color: cat.textColor }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: surface.textPrimary }}>
                      {cat.name}
                      {isHighest && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase" style={{ background: `${semantic.danger}10`, color: semantic.danger, border: `1px solid ${semantic.danger}20` }}>
                          Highest <ArrowUpRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px]" style={{ color: surface.textSecondary }}>Annual emission stats</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold leading-tight" style={{ color: surface.textPrimary }}>
                    {cat.tons} <span className="text-[10px] font-normal" style={{ color: surface.textSecondary }}>t CO₂</span>
                  </p>
                  <span className="text-[10px] font-semibold" style={{ color: surface.textSecondary }}>{cat.pct}% of footprint</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: surface.base }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * i, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};