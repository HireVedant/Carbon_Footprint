import React from 'react';
import { Award, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface EcoScoreBadgeProps {
  score: number;
}

export const EcoScoreBadge: React.FC<EcoScoreBadgeProps> = ({ score }) => {
  let label = '';
  let colorClass = '';
  let Icon = Award;
  let explanation = '';

  if (score >= 85) {
    label = 'Excellent';
    colorClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    Icon = Award;
    explanation = 'Your carbon footprint is remarkably low. You are playing an active, exemplary role in mitigating environmental impact.';
  } else if (score >= 70) {
    label = 'Good';
    colorClass = 'bg-green-500/10 border-green-500/30 text-green-400';
    Icon = CheckCircle;
    explanation = 'You maintain a conscious lifestyle with a low carbon impact. A few minor changes can optimize your carbon footprint further.';
  } else if (score >= 50) {
    label = 'Average';
    colorClass = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    Icon = AlertTriangle;
    explanation = 'Your carbon footprint aligns with standard consumer averages. Implementing localized reductions will yield significant improvement.';
  } else {
    label = 'Poor';
    colorClass = 'bg-red-500/10 border-red-500/30 text-red-400';
    Icon = AlertOctagon;
    explanation = 'Your carbon emissions are relatively high compared to global baselines. We suggest acting on our reduction tips to lower your footprint.';
  }

  return (
    <div className="glass p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-dark-400 uppercase tracking-wider">Eco Rating</span>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${colorClass}`}>
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
      </div>
      
      <p className="text-sm text-white font-medium mb-2 leading-snug">
        Eco Score rating of <span className="text-primary-400 font-bold">{score}/100</span>.
      </p>
      
      <p className="text-xs text-dark-400 leading-relaxed">
        {explanation}
      </p>
    </div>
  );
};
