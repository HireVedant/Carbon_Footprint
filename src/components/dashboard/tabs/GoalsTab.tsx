/**
 * Goals Tab — Dashboard
 *
 * Shows: AI Improvement Preview, What-If Simulator, Action Plan, History/Report buttons.
 * All data is pre-computed by Dashboard.tsx and passed as props.
 */
import React from 'react';
import { ImprovementPreview } from '../ImprovementPreview';
import { WhatIfSimulator } from '../WhatIfSimulator';
import { CategoryCard } from '../CategoryCard';
import { ActionButtons } from '../ActionButtons';

interface BreakdownShape {
  transport: number;
  energy: number;
  food: number;
  waste: number;
  shopping: number;
}

interface GoalsTabProps {
  activeResult: any;
  totalKg: number;
  totalTonnes: number;
  ecoScore: number;
  breakdown: BreakdownShape;
  historyDocs: any[];
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  activeResult,
  totalKg,
  totalTonnes,
  ecoScore,
  breakdown,
  historyDocs,
}) => {
  const legacyResults = {
    transportEmissions: breakdown.transport,
    energyEmissions: breakdown.energy,
    foodEmissions: breakdown.food,
    wasteEmissions: breakdown.waste,
    shoppingEmissions: breakdown.shopping,
    totalEmissions: totalKg,
    annualEstimate: totalTonnes,
    ecoScore,
  } as any;

  return (
    <div className="space-y-6">
      {/* ── AI Coach — Improvement Preview ────────────────────────────────────── */}
      <ImprovementPreview
        answers={activeResult?.answers}
        results={legacyResults}
      />

      {/* ── What-If Simulator ─────────────────────────────────────────────────── */}
      {activeResult && (
        <WhatIfSimulator
          baseAnswers={activeResult.answers || {}}
          baseTotalKg={totalKg}
        />
      )}

      {/* ── Action Plan ───────────────────────────────────────────────────────── */}
      <CategoryCard results={legacyResults} />

      {/* ── History & Report ──────────────────────────────────────────────────── */}
      <div
        className="pt-6 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <ActionButtons historyDocs={historyDocs} />
      </div>
    </div>
  );
};
