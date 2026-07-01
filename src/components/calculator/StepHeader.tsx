import React from 'react';

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ stepNumber, title, description }) => {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider mb-3">
        Step {stepNumber} of 5
      </div>
      <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
        {title}
      </h2>
      <p className="text-sm text-dark-400 max-w-xl">
        {description}
      </p>
    </div>
  );
};
