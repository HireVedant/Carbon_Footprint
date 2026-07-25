import React, { useState } from 'react';
import { Sparkles, TrendingUp, HelpCircle, CheckCircle } from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';
import { AssessmentAnswers } from '../../utils/calculationEngine';
import { motion } from 'framer-motion';

interface InsightCardProps {
  results: CalculationResult;
  /** Optional v2 assessment answers for diet-aware insights. Falls back to emission-based heuristics if absent. */
  answers?: Partial<AssessmentAnswers>;
}

export const InsightCard: React.FC<InsightCardProps> = ({ results, answers }) => {
  const {
    transportEmissions,
    energyEmissions,
    foodEmissions,
    wasteEmissions,
    totalEmissions,
  } = results;

  // Calculate percentages
  const transportPct = Math.round((transportEmissions / totalEmissions) * 100);
  const energyPct = Math.round((energyEmissions / totalEmissions) * 100);
  const foodPct = Math.round((foodEmissions / totalEmissions) * 100);
  const wastePct = Math.round((wasteEmissions / totalEmissions) * 100);

  const categories = [
    { name: 'Transportation', pct: transportPct, val: transportEmissions },
    { name: 'Household Energy', pct: energyPct, val: energyEmissions },
    { name: 'Diet & Food', pct: foodPct, val: foodEmissions },
    { name: 'Waste & Shopping', pct: wastePct, val: wasteEmissions },
  ];

  // Sort categories descending
  const sorted = [...categories].sort((a, b) => b.val - a.val);
  const highest = sorted[0];
  const secondHighest = sorted[1];

  // Food comparison: ICAR Indian dietary average food footprint ~1,400 kg CO2/year
  const foodEmissionsTons = parseFloat((foodEmissions / 1000).toFixed(2));
  const isFoodBelowAverage = foodEmissions < 1400;

  // Diet-aware food observation — prefer v2 answers if available, else derive from food emission quantum
  const dietType = answers?.dietType;
  const isVegetarianOrVegan =
    dietType === 'vegan' ||
    dietType === 'lacto_vegetarian' ||
    // Legacy v1 field compat (diet passed as part of a mapped v1 result object)
    (answers as any)?.diet === 'vegetarian' ||
    (answers as any)?.diet === 'vegan';

  const dietLabel = dietType === 'vegan'
    ? 'vegan'
    : dietType === 'lacto_vegetarian'
    ? 'vegetarian'
    : isVegetarianOrVegan
    ? 'plant-based'
    : null;

  let foodObservationText: string;
  if (isVegetarianOrVegan && dietLabel) {
    foodObservationText = isFoodBelowAverage
      ? `Your ${dietLabel} diet keeps food emissions low at ${foodEmissionsTons} t/yr — well below reference averages. Excellent sustainable choice!`
      : `Your food emissions contribute ${foodPct}% of your footprint. Consider reducing food waste and buying more local produce to lower this further.`;
  } else {
    foodObservationText = isFoodBelowAverage
      ? `Your food footprint is below reference averages (${foodEmissionsTons} t/yr), demonstrating sustainable dietary choices.`
      : `Your food emissions contribute ${foodPct}% of your footprint. Incorporating plant-based meals can help lower this.`;
  }

  // Build observations list
  const observations = [
    {
      text: `${highest.name} is your highest emissions contributor, accounting for ${highest.pct}% of your footprint. Focus mitigation efforts here first.`,
      icon: TrendingUp,
    },
    {
      text: `${secondHighest.name} is your second highest contributor, producing ${secondHighest.pct}% of total emissions.`,
      icon: HelpCircle,
    },
    {
      text: foodObservationText,
      icon: CheckCircle,
    },
  ];

  // Active insight state — first card highlighted by default, click persists selection
  const [activeInsight, setActiveInsight] = useState(0);

  return (
    <div className="glass p-6 hover:border-white/15 transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">AI Carbon Insights</h3>
        </div>
        
        <div className="space-y-4">
          {observations.map((obs, idx) => {
            const Icon = obs.icon;
            const isActive = activeInsight === idx;
            return (
              <motion.div
                key={idx}
                onMouseEnter={() => setActiveInsight(idx)}
                onClick={() => setActiveInsight(idx)}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
                className={`p-4 rounded-2xl border text-xs leading-relaxed flex gap-3 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-700/40 bg-slate-900/30 text-slate-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-dark-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{obs.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <p className="text-[10px] text-dark-500 mt-4 text-center italic">
        Observations are dynamically computed from your assessment answers and emission breakdown.
      </p>
    </div>
  );
};
