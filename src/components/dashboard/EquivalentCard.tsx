import React from 'react';
import { motion } from 'framer-motion';
import { TreePine, Car, Zap, Smartphone } from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';

interface EquivalentCardProps {
  results: CalculationResult;
}

export const EquivalentCard: React.FC<EquivalentCardProps> = ({ results }) => {
  const { totalEmissions } = results;

  // Conversions
  const treesCount = Math.max(1, Math.round(totalEmissions / 22)); // 1 tree offsets ~22 kg/yr
  const kmDriven = Math.max(0, Math.round(totalEmissions / 0.21)); // 0.21 kg/km for petrol car
  const electricityKwh = Math.max(0, Math.round(totalEmissions / 0.82)); // 0.82 kg/kWh
  const phoneCharges = Math.max(0, Math.round(totalEmissions / 0.008)); // 0.008 kg/charge (8g)

  const equivalents = [
    {
      label: 'Forestry Offset',
      value: treesCount.toLocaleString(),
      unit: 'mature trees',
      subtitle: 'Required to absorb this volume of carbon annually.',
      icon: TreePine,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    },
    {
      label: 'Driving Equivalent',
      value: kmDriven.toLocaleString(),
      unit: 'km driven',
      subtitle: 'Equivalent mileage in a standard internal combustion engine car.',
      icon: Car,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    },
    {
      label: 'Grid Electricity',
      value: electricityKwh.toLocaleString(),
      unit: 'kWh used',
      subtitle: 'Equivalent domestic power consumption drawn from the grid.',
      icon: Zap,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    },
    {
      label: 'Smartphone Charges',
      value: phoneCharges.toLocaleString(),
      unit: 'charges',
      subtitle: 'Equivalent number of full smartphone battery charge cycles.',
      icon: Smartphone,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <TreePine className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Environmental Equivalents</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {equivalents.map((eq, i) => {
          const Icon = eq.icon;
          return (
            <motion.div
              key={eq.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-2xl border flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300 ${eq.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">{eq.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-display font-bold text-white leading-tight">
                  {eq.value}
                  <span className="text-xs text-dark-400 font-normal ml-1 block sm:inline">{eq.unit}</span>
                </p>
                <p className="text-[9px] text-dark-500 mt-1 leading-snug">
                  {eq.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
