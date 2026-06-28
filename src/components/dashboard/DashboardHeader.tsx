import React from 'react';
import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  date: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ date }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Environmental <span className="gradient-text">Console</span>
        </h1>
        <p className="text-sm text-dark-400 mt-1">
          Monitor your ecological metrics, carbon footprint breakdowns, and mitigation actions.
        </p>
      </div>
      
      {/* Calculation Date Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-dark-300 text-xs font-semibold self-start md:self-auto">
        <Calendar className="w-4 h-4 text-primary-400" />
        Calculated on: <span className="text-white">{date}</span>
      </div>
    </div>
  );
};
