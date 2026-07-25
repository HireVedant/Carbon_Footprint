import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateEmissions, AssessmentAnswers } from '../../utils/calculationEngine';
import { Zap, Car, Plane, Sun, Recycle, TrendingDown } from 'lucide-react';

interface WhatIfSimulatorProps {
  baseAnswers: AssessmentAnswers;
  baseTotalKg: number;
}

interface SimulatorScenario {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  modifier: (answers: AssessmentAnswers) => AssessmentAnswers;
  active: boolean;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ baseAnswers, baseTotalKg }) => {
  const [activeScenarios, setActiveScenarios] = useState<Set<string>>(new Set());

  const scenarios: Omit<SimulatorScenario, 'active'>[] = [
    {
      id: 'solar_3kw',
      label: 'Install 3kW Solar',
      description: 'Rooftop solar generation offsets ~360 kWh/month from the grid.',
      icon: Sun,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      modifier: (a) => ({ ...a, solarInstalledKw: (a.solarInstalledKw || 0) + 3 }),
    },
    {
      id: 'ev_switch',
      label: 'Switch to Electric Car',
      description: 'Replace current petrol/diesel vehicle with an EV (Tata Nexon EV class).',
      icon: Car,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      modifier: (a) => ({ ...a, ownsVehicle: true, vehicleCategoryKey: 'car_electric' }),
    },
    {
      id: 'no_flights',
      label: 'Eliminate All Flights',
      description: 'Replace domestic air travel with train or video calls for one year.',
      icon: Plane,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      modifier: (a) => ({ ...a, flightDetails: [] }),
    },
    {
      id: 'veg_diet',
      label: 'Switch to Vegetarian Diet',
      description: 'Adopt a lacto-vegetarian diet — significant food footprint reduction.',
      icon: Recycle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      modifier: (a) => ({ ...a, dietType: 'lacto_vegetarian' as any }),
    },
    {
      id: 'induction_cooking',
      label: 'Switch to Induction Cooking',
      description: 'Replace LPG cylinder cooking with an efficient electric induction cooktop.',
      icon: Zap,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      modifier: (a) => ({ ...a, cookingFuel: 'induction' as any, cookingFuelConsumptionMonthly: 30 }),
    },
  ];

  // Apply all active scenario modifiers
  const projectedAnswers = useMemo(() => {
    let modified = { ...baseAnswers };
    scenarios.forEach(s => {
      if (activeScenarios.has(s.id)) {
        modified = s.modifier(modified);
      }
    });
    return modified;
  }, [activeScenarios, baseAnswers]);

  const projectedResult = useMemo(() => calculateEmissions(projectedAnswers), [projectedAnswers]);
  const savingKg = Math.max(0, baseTotalKg - projectedResult.totalKgCO2PerYear);
  const savingPercent = baseTotalKg > 0 ? Math.round((savingKg / baseTotalKg) * 100) : 0;

  const toggleScenario = (id: string) => {
    setActiveScenarios(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">What-If Simulator</h3>
            <p className="text-xs text-gray-400">Toggle scenarios to see your projected footprint reduction.</p>
          </div>
        </div>
        {activeScenarios.size > 0 && (
          <button
            onClick={() => setActiveScenarios(new Set())}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Scenario Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {scenarios.map(s => {
          const Icon = s.icon;
          const isActive = activeScenarios.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleScenario(s.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isActive
                  ? `${s.color} ring-1 ring-current/20`
                  : 'border-gray-700/60 bg-gray-800/50 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{s.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Projected Result */}
      <motion.div
        key={projectedResult.totalKgCO2PerYear}
        initial={{ opacity: 0.7, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-5 space-y-4"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Current</p>
            <p className="text-xl font-bold text-white">{(baseTotalKg / 1000).toFixed(2)}</p>
            <p className="text-[10px] text-gray-500">tonnes CO₂/yr</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <TrendingDown className={`w-6 h-6 ${savingPercent > 0 ? 'text-emerald-400' : 'text-gray-600'}`} />
            <p className={`text-lg font-bold ${savingPercent > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
              -{savingPercent}%
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Projected</p>
            <p className={`text-xl font-bold ${savingPercent > 0 ? 'text-emerald-400' : 'text-white'}`}>
              {projectedResult.totalTonnesCO2PerYear}
            </p>
            <p className="text-[10px] text-gray-500">tonnes CO₂/yr</p>
          </div>
        </div>

        {savingKg > 0 && (
          <div className="text-center pt-3 border-t border-white/10">
            <p className="text-sm text-gray-300">
              Combined scenarios would save{' '}
              <span className="font-bold text-emerald-400">{savingKg.toLocaleString()} kg CO₂/year</span>
              {' '}— equivalent to planting ~{Math.round(savingKg / 21)} trees annually.
            </p>
          </div>
        )}

        {activeScenarios.size === 0 && (
          <p className="text-center text-xs text-gray-500">Select scenarios above to simulate potential reductions.</p>
        )}
      </motion.div>
    </div>
  );
};
