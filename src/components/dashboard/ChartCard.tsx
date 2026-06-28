import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartCardProps {
  type: 'doughnut' | 'bar' | 'line';
  title: string;
  subtitle: string;
  data: any;
}

export const ChartCard: React.FC<ChartCardProps> = ({ type, title, subtitle, data }) => {
  const commonOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: {
            family: 'Inter',
            size: 11,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      x: type === 'doughnut' ? undefined : {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Inter',
            size: 10,
          },
        },
      },
      y: type === 'doughnut' ? undefined : {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Inter',
            size: 10,
          },
        },
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'doughnut':
        return <Doughnut data={data} options={commonOptions} />;
      case 'bar':
        return <Bar data={data} options={commonOptions} />;
      case 'line':
        return <Line data={data} options={commonOptions} />;
      default:
        return null;
    }
  };

  return (
    <div className="glass p-5 flex flex-col hover:border-white/15 transition-all duration-300 h-[320px]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-[11px] text-dark-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex-1 relative min-h-0">
        {renderChart()}
      </div>
    </div>
  );
};
