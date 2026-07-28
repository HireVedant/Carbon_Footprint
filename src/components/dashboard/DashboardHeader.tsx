import React from 'react';
import { Calendar } from 'lucide-react';
import { surface, fontFamily, emerald, radius } from '../../design';

interface DashboardHeaderProps {
  date: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ date }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
          Environmental <span className="gradient-text">Console</span>
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: surface.textSecondary, fontFamily: fontFamily.body }}>
          Monitor your ecological metrics, carbon footprint breakdowns, and mitigation actions.
        </p>
      </div>
      
      {/* Calculation Date Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 self-start md:self-auto" style={{ background: surface.panel, border: `1px solid ${surface.border}`, borderRadius: radius.lg }} aria-label={`Calculated on ${date}`}>
        <Calendar className="w-4 h-4" style={{ color: emerald[500] }} aria-hidden="true" />
        <span className="text-xs font-semibold" style={{ color: surface.textSecondary, fontFamily: fontFamily.body }}>
          Calculated on: <span style={{ color: surface.textPrimary }}>{date}</span>
        </span>
      </div>
    </div>
  );
};
