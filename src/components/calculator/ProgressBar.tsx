import React from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, Utensils, Trash2, CheckSquare } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { label: 'Transport', icon: Car },
  { label: 'Energy', icon: Zap },
  { label: 'Food', icon: Utensils },
  { label: 'Waste', icon: Trash2 },
  { label: 'Review', icon: CheckSquare },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-10">
      {/* Visual bar */}
      <div className="relative h-1 bg-white/10 rounded-full mb-6">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Steps icons/labels */}
      <div className="grid grid-cols-5 text-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-110'
                    : isActive
                    ? 'bg-primary-500/10 border-primary-500/50 text-primary-300'
                    : 'bg-white/5 border-white/10 text-dark-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
              </div>
              <span
                className={`mt-2 text-xs font-semibold tracking-wide uppercase transition-colors duration-300 hidden md:block ${
                  isCurrent
                    ? 'text-primary-400 font-bold'
                    : isActive
                    ? 'text-primary-300/80'
                    : 'text-dark-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
