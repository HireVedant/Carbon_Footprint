import React from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, Utensils, Trash2, ArrowUpRight } from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';

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
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/10',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    },
    {
      name: 'Household Energy',
      value: energyEmissions,
      tons: energyTons,
      pct: energyPct,
      icon: Zap,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/10',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    },
    {
      name: 'Diet & Food Sourcing',
      value: foodEmissions,
      tons: foodTons,
      pct: foodPct,
      icon: Utensils,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/10',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    },
    {
      name: 'Waste & Shopping',
      value: wasteEmissions,
      tons: wasteTons,
      pct: wastePct,
      icon: Trash2,
      color: 'bg-pink-500',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500/10',
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.1)]',
    },
  ];

  // Determine highest emitting category
  const highestValue = Math.max(...categories.map((c) => c.value));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">Carbon Breakdown Details</h3>
        <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">Sector Specifics</span>
      </div>

      <div className="space-y-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const isHighest = cat.value === highestValue;

          return (
            <div
              key={cat.name}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isHighest
                  ? `bg-white/[0.04] border-primary-500/30 ${cat.glow} scale-[1.01]`
                  : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${cat.textColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {cat.name}
                      {isHighest && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                          Highest <ArrowUpRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-dark-500">Annual emission stats</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-white leading-tight">
                    {cat.tons} <span className="text-[10px] text-dark-400 font-normal">t CO₂</span>
                  </p>
                  <span className="text-[10px] text-dark-500 font-semibold">{cat.pct}% of footprint</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${cat.color} rounded-full`}
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
