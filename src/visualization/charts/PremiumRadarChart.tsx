/**
 * Premium Radar Chart
 *
 * Compares user vs India average vs community average across categories.
 * Uses Chart.js radar with custom dark editorial styling.
 */

import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface PremiumRadarChartProps {
  data: ReturnType<typeof import('../providers/VisualizationDataProvider').VisualizationDataProvider.getRadarData>;
  height?: number;
}

export const PremiumRadarChart: React.FC<PremiumRadarChartProps> = ({ data, height = 300 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <Radar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                font: { size: 10, family: 'Inter, sans-serif' },
                boxWidth: 12,
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle',
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
            },
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                display: false,
                stepSize: 25,
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.06)',
                circular: true,
              },
              angleLines: {
                color: 'rgba(255, 255, 255, 0.08)',
              },
              pointLabels: {
                color: '#94a3b8',
                font: { size: 10, family: 'Inter, sans-serif', weight: 'bold' },
              },
            },
          },
          animation: {
            duration: 800,
            easing: 'easeOutQuart',
          },
        }}
      />
    </div>
  );
};