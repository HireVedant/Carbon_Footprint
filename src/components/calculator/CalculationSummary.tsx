import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingDown,
  TreePine,
  Zap,
  ArrowRight,
  RefreshCw,
  Car,
  Utensils,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import Button from '../ui/Button';

export const CalculationSummary: React.FC = () => {
  const { results, resetCalculator } = useCalculator();

  if (!results) return null;

  const {
    transportEmissions,
    energyEmissions,
    foodEmissions,
    wasteEmissions,
    totalEmissions,
    annualEstimate,
    ecoScore,
    ecoLabel,
    ecoColor,
  } = results;

  // Convert kg to tons for breakdown
  const transportTons = parseFloat((transportEmissions / 1000).toFixed(2));
  const energyTons = parseFloat((energyEmissions / 1000).toFixed(2));
  const foodTons = parseFloat((foodEmissions / 1000).toFixed(2));
  const wasteTons = parseFloat((wasteEmissions / 1000).toFixed(2));

  // Determine highest sector
  const sectors = [
    { name: 'Transportation', value: transportEmissions, icon: Car, color: 'bg-blue-500' },
    { name: 'Energy', value: energyEmissions, icon: Zap, color: 'bg-amber-500' },
    { name: 'Food', value: foodEmissions, icon: Utensils, color: 'bg-emerald-500' },
    { name: 'Waste', value: wasteEmissions, icon: Trash2, color: 'bg-pink-500' },
  ];

  const highestSector = [...sectors].sort((a, b) => b.value - a.value)[0];

  // Actions tips based on highest sector
  const getActionTips = () => {
    switch (highestSector.name) {
      case 'Transportation':
        return [
          'Consider carpooling or using public transport like buses or trains for daily commutes.',
          'If possible, switch to an electric vehicle (EV) or a hybrid for your next car purchase.',
          'Consolidate trips and try walking or cycling for short distances under 2-3 km.',
        ];
      case 'Energy':
        return [
          'Optimize your AC usage. Raising the temperature by just 1°C can save up to 6% electricity.',
          'Transition to energy-efficient LED bulbs and turn off devices at the plug when not in use.',
          'Invest in smart thermostats or solar panels to offset grid electricity dependence.',
        ];
      case 'Food':
        return [
          'Consider incorporating more plant-based meals if appropriate for your diet.',
          'Plan meals in advance to reduce food waste. Compost whatever organic waste remains.',
          'Support local agriculture by purchasing locally grown, seasonal produce.',
        ];
      case 'Waste':
        return [
          'Set up distinct bins for dry recyclables, compostable organic waste, and landfill refuse.',
          'Practice reuse and repair before buying new clothes or electronic products.',
          'Reduce single-use plastic by carrying reusable shopping bags and water bottles.',
        ];
      default:
        return [];
    }
  };

  const tips = getActionTips();

  // Reference comparison (Global average is about 4.5 tons CO2/year)
  const comparisonPercent = Math.abs(Math.round(((annualEstimate - 4.5) / 4.5) * 100));
  const isBelowAverage = annualEstimate <= 4.5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Top Banner Overview */}
      <div className="glass-strong p-6 sm:p-8 relative overflow-hidden rounded-3xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-3 ${ecoColor}`}>
              {ecoLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              <span className="gradient-text">{annualEstimate}</span> Tons CO₂ / yr
            </h2>
            <p className="text-sm text-dark-400 max-w-md">
              Your estimated annual carbon footprint. That's{' '}
              <span className="text-white font-medium">
                {isBelowAverage ? `${comparisonPercent}% below` : `${comparisonPercent}% above`}
              </span>{' '}
              the global average reference of 4.5 tons.
            </p>
          </div>

          {/* Eco Score Circular Widget */}
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-lg">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-white/10"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-primary-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 48}
                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - ecoScore / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-3xl font-display font-bold text-white">{ecoScore}</span>
              <span className="block text-[10px] text-dark-400 font-bold uppercase tracking-wider">Eco Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown and Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Breakdown bar graph */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Emissions Breakdown</h3>
            <div className="space-y-4">
              {sectors.map((sec) => {
                const percentage = totalEmissions > 0 ? (sec.value / totalEmissions) * 100 : 0;
                const valueTons = parseFloat((sec.value / 1000).toFixed(2));
                const Icon = sec.icon;
                return (
                  <div key={sec.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-dark-300">
                        <Icon className="w-3.5 h-3.5" />
                        {sec.name}
                      </div>
                      <span className="text-white">{valueTons} t ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${sec.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-dark-400">
            <TreePine className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
            <span>
              Offsetting your emissions requires planting approximately{' '}
              <span className="text-emerald-400 font-bold">
                {Math.round(annualEstimate * 45)}
              </span>{' '}
              trees every year.
            </span>
          </div>
        </div>

        {/* AI Recommendations / Action plan */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Action Plan: Highest Sector ({highestSector.name})
          </h3>
          <p className="text-xs text-dark-400 mb-4 leading-relaxed">
            Based on your answers, your highest carbon source is{' '}
            <span className="text-white font-medium capitalize">{highestSector.name}</span>. Here is
            how you can start reducing it today:
          </p>
          <ul className="space-y-3">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400 flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-xs text-dark-300 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action panel */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          variant="secondary"
          onClick={resetCalculator}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake Calculator
        </Button>
        <Link to="/dashboard" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
