/**
 * StateInsightPanel — Transparent Data Quality Display
 *
 * Shows detailed state metrics with explicit source attribution,
 * confidence levels, and estimated flags. Never presents
 * estimates as facts.
 */

import React, { useMemo } from 'react';
import { VisualizationDataProvider, StateDataRecord } from '../providers/VisualizationDataProvider';

interface Props {
  stateName: string;
  onClose: () => void;
}

function confidenceColor(c: number): string {
  if (c >= 0.85) return 'text-emerald-400';
  if (c >= 0.70) return 'text-green-400';
  if (c >= 0.55) return 'text-amber-400';
  return 'text-orange-400';
}

function confidenceLabel(c: number): string {
  if (c >= 0.85) return 'High';
  if (c >= 0.70) return 'Good';
  if (c >= 0.55) return 'Moderate';
  return 'Low';
}

function TrendArrow({ value, benchmark }: { value: number; benchmark: number }) {
  if (benchmark === 0) return <span className="text-dark-500 text-xs">—</span>;
  const diff = ((value - benchmark) / benchmark) * 100;
  if (Math.abs(diff) < 1) return <span className="text-dark-500 text-xs">≈ avg</span>;
  const isUp = diff > 0;
  return (
    <span className={`text-xs font-medium ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
      {isUp ? '▲' : '▼'} {Math.abs(diff).toFixed(0)}%
    </span>
  );
}

/** Generate data-driven recommendations based on actual metrics */
function generateRecommendations(d: StateDataRecord): string[] {
  const recs: string[] = [];
  
  if (d.gridFactor > 750) {
    recs.push(`Grid intensity is ${d.gridFactor} gCO₂/kWh — above national average. Switching to certified renewable electricity could reduce your electricity emissions by ~${Math.round(((d.gridFactor - 450) / d.gridFactor) * 100)}%.`);
  }
  
  if (d.renewablePct < 20) {
    recs.push(`Only ${d.renewablePct}% of state generation is renewable. Advocating for rooftop solar or green energy tariffs would have outsized impact here.`);
  } else if (d.renewablePct >= 35) {
    recs.push(`${d.renewablePct}% renewable generation is above national average. The grid is already cleaner — focus on transport and food emissions.`);
  }
  
  if (d.ecoScore !== null && d.ecoScore < 55) {
    recs.push(`Community eco score of ${d.ecoScore}/100 suggests high-impact opportunities in transport mode switching and waste segregation.`);
  } else if (d.ecoScore === null) {
    recs.push('No community assessments recorded for this state yet. Be the first to contribute data!');
  }
  
  if (d.co2PerCapita > 1.8) {
    recs.push(`Per-capita emissions of ${d.co2PerCapita} tCO₂e are above the national average (~1.5 t). Focus on energy efficiency and transport reduction.`);
  } else if (d.co2PerCapita < 1.0) {
    recs.push(`Per-capita emissions of ${d.co2PerCapita} tCO₂e are below national average. Maintain current patterns while improving energy access.`);
  }
  
  if (d.transportPct > 30) {
    recs.push(`Transport contributes ${d.transportPct}% of state GHG — prioritizing public transit and EV adoption would have major impact.`);
  }
  
  if (d.householdPct > 38) {
    recs.push(`Household energy is ${d.householdPct}% of state GHG. Improve building insulation, switch to induction cooktops, and use energy-efficient appliances.`);
  }
  
  if (recs.length === 0) {
    recs.push('This state shows balanced emission patterns. Focus on incremental improvements across all categories.');
  }
  
  return recs.slice(0, 4);
}

export function StateInsightPanel({ stateName, onClose }: Props) {
  const stateData = useMemo(
    () => VisualizationDataProvider.getStateData(stateName),
    [stateName]
  );
  const overallStats = useMemo(() => VisualizationDataProvider.getOverallStats(), []);

  if (!stateData) {
    return (
      <div className="glass-strong rounded-2xl p-5 h-full flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-dark-400 text-center">No verified data available for "{stateName}"</p>
        <button
          onClick={onClose}
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
        >
          Dismiss
        </button>
      </div>
    );
  }

  const recommendations = useMemo(() => generateRecommendations(stateData), [stateData]);
  
  // Compute ranks dynamically using getAllStateNames + getStateData
  const allStateNames = VisualizationDataProvider.getAllStateNames();
  const allStateRecords: StateDataRecord[] = allStateNames
    .map((name) => VisualizationDataProvider.getStateData(name))
    .filter((s): s is StateDataRecord => s !== null);
  
  // Participation rank: null participation means no ranking available
  const participationRank = stateData.participation !== null
    ? allStateRecords
        .filter((s) => s.participation !== null)
        .sort((a, b) => (b.participation ?? 0) - (a.participation ?? 0))
        .findIndex((s) => s.stateName === stateName) + 1
    : null;
  
  // Eco score rank: null eco score means no ranking available
  const ecoScoreRank = stateData.ecoScore !== null
    ? allStateRecords
        .filter((s) => s.ecoScore !== null)
        .sort((a, b) => (b.ecoScore ?? 0) - (a.ecoScore ?? 0))
        .findIndex((s) => s.stateName === stateName) + 1
    : null;

  // Count estimated fields
  const estimatedCount = stateData.estimatedFields.length;
  const totalFields = 6; // population, gridFactor, renewablePct, co2PerCapita, participation, ecoScore

  return (
    <div className="glass-strong rounded-2xl p-5 h-full flex flex-col overflow-y-auto max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white font-display">{stateName}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-dark-400 hover:text-white"
          aria-label={`Close ${stateName} panel`}
        >
          ✕
        </button>
      </div>

      {/* Population */}
      <div className="mb-3 pb-3 border-b border-white/5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-dark-400">Population (Projected 2024)</span>
          <span className="text-xs text-dark-500">{stateData.populationSource}</span>
        </div>
        <p className="text-lg font-bold text-white font-display mt-1">
          {stateData.populationProjected >= 1_000_000
            ? `${(stateData.populationProjected / 1_000_000).toFixed(1)}M`
            : `${(stateData.populationProjected / 1_000).toFixed(0)}K`}
          {stateData.estimatedFields.includes('populationProjected') && (
            <span className="text-[10px] text-amber-400/70 ml-1.5 font-normal">estimated</span>
          )}
        </p>
        <p className="text-[10px] text-dark-500 mt-0.5">Census 2011: {stateData.population.toLocaleString()}</p>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        {/* Participation */}
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">Participation</span>
            {participationRank !== null && participationRank > 0 ? (
              <span className="text-[10px] text-dark-400">National Rank #{participationRank}</span>
            ) : (
              <span className="text-[10px] text-amber-400/70">No state data</span>
            )}
          </div>
          <p className="text-lg font-bold text-dark-500 font-display">
            {stateData.participation !== null ? stateData.participation : '—'}
          </p>
          <p className="text-[10px] text-dark-500 mt-0.5">
            {stateData.participation !== null ? 'community assessments' : 'Insufficient community assessments'}
          </p>
        </div>

        {/* Eco Score */}
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">Avg Eco Score</span>
            {ecoScoreRank !== null && ecoScoreRank > 0 ? (
              <span className="text-[10px] text-dark-400">National Rank #{ecoScoreRank}</span>
            ) : (
              <span className="text-[10px] text-amber-400/70">No state data</span>
            )}
          </div>
          <p className="text-lg font-bold text-dark-500 font-display">
            {stateData.ecoScore !== null ? `${stateData.ecoScore}/100` : '—'}
          </p>
          <p className="text-[10px] text-dark-500 mt-0.5">
            {stateData.ecoScore !== null ? 'community average' : 'No community data available'}
          </p>
        </div>

        {/* Grid Emission Factor */}
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">Grid Emissions</span>
            <span className={`text-[10px] ${confidenceColor(stateData.gridFactorConfidence)}`}>
              {confidenceLabel(stateData.gridFactorConfidence)}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-white font-display">{stateData.gridFactor}</p>
            <span className="text-xs text-dark-400">gCO₂/kWh</span>
            <TrendArrow value={stateData.gridFactor} benchmark={overallStats.avgGridFactor} />
          </div>
          <p className="text-[10px] text-dark-500 mt-0.5">{stateData.gridFactorSource}</p>
          <p className="text-[10px] text-dark-500">{stateData.gridFactorNote}</p>
        </div>

        {/* Renewable Share */}
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">Renewable Energy</span>
            <span className={`text-[10px] ${confidenceColor(stateData.renewableConfidence)}`}>
              {confidenceLabel(stateData.renewableConfidence)}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-white font-display">{stateData.renewablePct}%</p>
            <TrendArrow value={stateData.renewablePct} benchmark={overallStats.avgRenewable} />
          </div>
          <p className="text-[10px] text-dark-500 mt-0.5">{stateData.renewableSource} ({stateData.renewableYear})</p>
        </div>

        {/* CO₂ per Capita */}
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">CO₂ per Capita</span>
            <span className={`text-[10px] ${confidenceColor(stateData.co2Confidence)}`}>
              {confidenceLabel(stateData.co2Confidence)}
              {stateData.co2Estimated && <span className="text-amber-400/70 ml-1">est.</span>}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-white font-display">{stateData.co2PerCapita}</p>
            <span className="text-xs text-dark-400">tCO₂e/yr</span>
            <TrendArrow value={stateData.co2PerCapita} benchmark={overallStats.avgCo2PerCapita} />
          </div>
          <p className="text-[10px] text-dark-500 mt-0.5">{stateData.co2Source}</p>
          <p className="text-[10px] text-dark-500">{stateData.co2Note}</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
          Data-Driven Recommendations
        </h4>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-dark-300 leading-relaxed bg-white/5 rounded-lg p-2.5">
              <span className="text-primary-400 mt-0.5 flex-shrink-0">→</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Quality Footer */}
      <div className="mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] text-dark-500 mb-1">
          <span>Overall Confidence</span>
          <span className={confidenceColor(stateData.confidenceScore)}>
            {Math.round(stateData.confidenceScore * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${stateData.confidenceScore * 100}%`,
              backgroundColor: stateData.confidenceScore >= 0.7 ? '#10b981' : stateData.confidenceScore >= 0.5 ? '#f59e0b' : '#f97316',
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-dark-500">
          <span>{estimatedCount}/{totalFields} fields estimated</span>
          <span>{stateData.lastUpdated}</span>
        </div>
        <p className="text-[9px] text-dark-600 mt-1.5 leading-relaxed">
          Government data from CEA, Census, Ember, NITI Aayog.
          Community data from EcoTrack assessments.
          {stateData.estimatedFields.length > 0 && (
            <> Estimated fields: {stateData.estimatedFields.join(', ')}.</>
          )}
        </p>
      </div>
    </div>
  );
}