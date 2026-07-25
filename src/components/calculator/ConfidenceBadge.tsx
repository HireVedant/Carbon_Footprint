import React from 'react';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number; // 0-100
  rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  rating,
  label,
  showPercentage = true,
  size = 'sm'
}) => {
  const config = {
    HIGH: {
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      icon: ShieldCheck,
      label: 'High Accuracy'
    },
    MEDIUM: {
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      icon: AlertTriangle,
      label: 'Moderate Accuracy'
    },
    ESTIMATE: {
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      icon: Info,
      label: 'Estimated'
    }
  };

  const c = config[rating];
  const Icon = c.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bgColor} ${c.borderColor} ${c.textColor} ${sizeClasses[size]}`}
      title={`${label || c.label}: ${score}% confidence`}
    >
      <Icon className={iconSize[size]} />
      {label && <span>{label}</span>}
      {showPercentage && <span>{score}%</span>}
    </span>
  );
};

interface ConfidenceBreakdownCardProps {
  confidence: {
    overallScore: number;
    overallRating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
    transport?: { score: number; rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE'; rationales?: string[] };
    energy?: { score: number; rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE'; rationales?: string[] };
    food?: { score: number; rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE'; rationales?: string[] };
    waste?: { score: number; rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE'; rationales?: string[] };
    shopping?: { score: number; rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE'; rationales?: string[] };
  };
}

export const ConfidenceBreakdownCard: React.FC<ConfidenceBreakdownCardProps> = ({ confidence }) => {
  const categories = [
    { key: 'energy', label: 'Energy', color: 'bg-amber-500', data: confidence.energy },
    { key: 'transport', label: 'Transport', color: 'bg-cyan-500', data: confidence.transport },
    { key: 'food', label: 'Food', color: 'bg-rose-500', data: confidence.food },
    { key: 'waste', label: 'Waste', color: 'bg-violet-500', data: confidence.waste },
    { key: 'shopping', label: 'Shopping', color: 'bg-indigo-500', data: confidence.shopping }
  ];

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Calculation Confidence</h3>
            <p className="text-xs text-gray-400">Higher confidence = more specific data provided.</p>
          </div>
        </div>
        <ConfidenceBadge score={confidence.overallScore} rating={confidence.overallRating} label="Overall" size="md" />
      </div>

      <div className="space-y-3">
        {categories.map(cat => {
          if (!cat.data) return null;
          return (
            <div key={cat.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium">{cat.label}</span>
                <ConfidenceBadge score={cat.data.score} rating={cat.data.rating} size="sm" />
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cat.color}`}
                  style={{ width: `${cat.data.score}%` }}
                />
              </div>
              {cat.data.rationales && cat.data.rationales.length > 0 && (
                <p className="text-[10px] text-gray-500 pl-1">{cat.data.rationales[0]}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
