import React from 'react';
import { Sparkles, TrendingUp, HelpCircle, CheckCircle } from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';

interface InsightCardProps {
  results: CalculationResult;
}

export const InsightCard: React.FC<InsightCardProps> = ({ results }) => {
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

  // Food comparison: global daily food average footprint is ~1400 kg CO2/year
  const foodEmissionsTons = parseFloat((foodEmissions / 1000).toFixed(2));
  const isFoodBelowAverage = foodEmissions < 1400;

  // Let's form the list of observations
  const observations = [
    {
      type: 'highest',
      text: `${highest.name} is your highest emissions contributor, accounting for ${highest.pct}% of your footprint. Focus mitigation efforts here first.`,
      icon: TrendingUp,
      highlight: true,
    },
    {
      type: 'second',
      text: `${secondHighest.name} is your second highest contributor, producing ${secondHighest.pct}% of total emissions.`,
      icon: HelpCircle,
      highlight: false,
    },
    {
      type: 'food',
      text: isFoodBelowAverage
        ? `Your food footprint is below reference averages (${foodEmissionsTons} tons/yr), demonstrating sustainable dietary choices.`
        : `Your food emissions contribute ${foodPct}% of your footprint. Incorporating plant-based meals can help lower this.`,
      icon: CheckCircle,
      highlight: false,
    },
  ];

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
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs leading-relaxed flex gap-3 transition-all ${
                  obs.highlight
                    ? 'bg-primary-500/5 border-primary-500/30 text-primary-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'bg-white/[0.02] border-white/5 text-dark-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  obs.highlight ? 'bg-primary-500/10 text-primary-400' : 'bg-white/5 text-dark-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{obs.text}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <p className="text-[10px] text-dark-500 mt-4 text-center italic">
        Observations are dynamically computed based on your current carbon survey answers.
      </p>
    </div>
  );
};
