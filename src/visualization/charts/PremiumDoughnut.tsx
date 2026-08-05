/**
 * Premium Doughnut Chart
 *
 * Emission breakdown with rounded edges, inner glow, animated loading,
 * center metric, hover expansion. Dark editorial styling.
 */

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PremiumDoughnutProps {
  data: ReturnType<typeof import('../providers/VisualizationDataProvider').VisualizationDataProvider.getDoughnutData>;
  centerValue?: string;
  centerLabel?: string;
  height?: number;
}

export const PremiumDoughnut: React.FC<PremiumDoughnutProps> = ({
  data,
  centerValue,
  centerLabel,
  height = 300,
}) => {
  return (
    <div className="relative w-full" style={{ height }}>
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#475569',
                font: { size: 10, family: 'Inter, sans-serif' },
                boxWidth: 10,
                padding: 10,
                usePointStyle: true,
                pointStyle: 'rectRounded',
              },
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleColor: '#e2e8f0',
              bodyColor: '#94a3b8',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              titleFont: { size: 11, weight: 'bold' as const },
              bodyFont: { size: 10 },
              callbacks: {
                label: (ctx) => {
                  const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((ctx.raw as number / total) * 100) : 0;
                  return ` ${ctx.label}: ${ctx.raw} kg (${pct}%)`;
                },
              },
            },
          },
          animation: {
            animateRotate: true,
            duration: 1000,
            easing: 'easeOutQuart',
          },
        }}
      />
      {centerValue && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: -30 }}>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-text-primary">{centerValue}</p>
            {centerLabel && <p className="text-[9px] text-dark-500 uppercase tracking-wider">{centerLabel}</p>}
          </div>
        </div>
      )}
    </div>
  );
};