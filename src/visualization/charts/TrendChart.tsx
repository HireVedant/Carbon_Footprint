/**
 * Trend Chart
 *
 * Line/area/stacked bar chart with premium dark styling.
 * Used for historical emissions, category evolution, comparison views.
 */

import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, BarElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

interface TrendChartProps {
  type?: 'line' | 'bar' | 'stacked-bar';
  data: any;
  title?: string;
  subtitle?: string;
  height?: number;
}

const baseOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8',
        font: { size: 10, family: 'Inter, sans-serif' },
        boxWidth: 10,
        padding: 12,
        usePointStyle: true,
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
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 9 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 9 } },
    },
  },
  animation: { duration: 800, easing: 'easeOutQuart' },
};

export const TrendChart: React.FC<TrendChartProps> = ({
  type = 'line',
  data,
  title,
  subtitle,
  height = 260,
}) => {
  return (
    <div className="w-full" style={{ height }}>
      {type === 'line' && (
        <Line data={data} options={baseOptions} />
      )}
      {(type === 'bar' || type === 'stacked-bar') && (
        <Bar
          data={data}
          options={{
            ...baseOptions,
            ...(type === 'stacked-bar' ? {
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, stacked: true },
                y: { ...baseOptions.scales.y, stacked: true },
              },
            } : {}),
          }}
        />
      )}
    </div>
  );
};