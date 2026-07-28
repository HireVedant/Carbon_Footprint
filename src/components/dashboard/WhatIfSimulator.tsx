import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateEmissions, AssessmentAnswers } from '../../utils/calculationEngine';
import { Zap, Car, Plane, Sun, Recycle, TrendingDown } from 'lucide-react';
import { surface, emerald, fontFamily, radius, solar, water, semantic } from '../../design';

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
    <div className="p-6 rounded-3xl space-y-6" style={{ background: surface.panel, border: `1px solid ${surface.border}`, borderRadius: radius['2xl'] }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: `1px solid ${surface.border}` }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `${emerald[500]}1A`, color: emerald[400] }}>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: surface.textPrimary }}>What-If Simulator</h3>
            <p className="text-xs" style={{ color: surface.textSecondary }}>Toggle scenarios to see your projected footprint reduction.</p>
          </div>
        </div>
        {activeScenarios.size > 0 && (
          <button
            onClick={() => setActiveScenarios(new Set())}
            className="text-xs transition-colors"
            style={{ color: surface.textSecondary }}
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
              className="text-left p-4 rounded-xl border transition-all"
              style={{
                borderColor: isActive ? `${s.color}33` : surface.border,
                background: isActive ? `${s.color}14` : surface.base,
                color: isActive ? surface.textPrimary : surface.textSecondary,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg" style={{ opacity: isActive ? 1 : 0.5, color: s.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: isActive ? surface.textPrimary : surface.textSecondary }}>{s.label}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: surface.textSecondary }}>{s.description}</p>
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
        className="rounded-xl p-5 space-y-4"
        style={{ background: surface.base }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: surface.textSecondary }}>Current</p>
            <p className="text-xl font-bold" style={{ color: surface.textPrimary }}>{(baseTotalKg / 1000).toFixed(2)}</p>
            <p className="text-[10px]" style={{ color: surface.textSecondary }}>tonnes CO₂/yr</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <TrendingDown className="w-6 h-6" style={{ color: savingPercent > 0 ? emerald[400] : surface.textSecondary }} />
            <p className="text-lg font-bold" style={{ color: savingPercent > 0 ? emerald[400] : surface.textSecondary }}>
              -{savingPercent}%
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: surface.textSecondary }}>Projected</p>
            <p className="text-xl font-bold" style={{ color: savingPercent > 0 ? emerald[400] : surface.textPrimary }}>
              {projectedResult.totalTonnesCO2PerYear}
            </p>
            <p className="text-[10px]" style={{ color: surface.textSecondary }}>tonnes CO₂/yr</p>
          </div>
        </div>

        {savingKg > 0 && (
          <div className="text-center pt-3" style={{ borderTop: `1px solid ${surface.border}` }}>
            <p className="text-sm" style={{ color: surface.textSecondary }}>
              Combined scenarios would save{' '}
              <span className="font-bold" style={{ color: emerald[400] }}>{savingKg.toLocaleString()} kg CO₂/year</span>
              {' '}— equivalent to planting ~{Math.round(savingKg / 21)} trees annually.
            </p>
          </div>
        )}

        {activeScenarios.size === 0 && (
          <p className="text-center text-xs" style={{ color: surface.textSecondary }}>Select scenarios above to simulate potential reductions.</p>
        )}
      </motion.div>
    </div>
  );
};
