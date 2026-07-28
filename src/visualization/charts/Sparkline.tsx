/**
 * Sparkline
 *
 * Tiny inline trend chart for KPI panels.
 * SVG-based, zero labels, just the trend shape.
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler);

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showDots?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#10b981',
  height = 40,
  width = 120,
  showDots = false,
}) => {
  const isPositive = data.length >= 2 && data[data.length - 1] <= data[0];

  const gradient = (ctx: any) => {
    if (!ctx.chart?.chartArea) return color;
    const gradient = ctx.chart.ctx.createLinearGradient(
      0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom
    );
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}05`);
    return gradient;
  };

  return (
    <div style={{ width, height }}>
      <Line
        data={{
          labels: data.map((_, i) => i),
          datasets: [{
            data,
            borderColor: isPositive ? '#10b981' : '#ef4444',
            backgroundColor: gradient,
            borderWidth: 1.5,
            fill: true,
            tension: 0.4,
            pointRadius: showDots ? 2 : 0,
            pointBackgroundColor: isPositive ? '#10b981' : '#ef4444',
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
          animation: { duration: 600 },
        }}
      />
    </div>
  );
};