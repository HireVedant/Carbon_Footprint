import React from 'react';
import { ArrowRight, Sparkles, Footprints, Flame, Plus } from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';
import { useState } from 'react';
import Toast, { ToastProps } from '../ui/Toast';
import { AnimatePresence } from 'framer-motion';

interface ImprovementPreviewProps {
  results: CalculationResult;
}

export const ImprovementPreview: React.FC<ImprovementPreviewProps> = ({ results }) => {
  const { totalEmissions } = results;
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Compute placeholder carbon savings relative to the actual emissions size
  const transportSavings = Math.round(totalEmissions * 0.12); // e.g. 12% savings by swapping commutes
  const dietSavings = Math.round(totalEmissions * 0.08); // e.g. 8% by diet modifications
  const energySavings = Math.round(totalEmissions * 0.05); // e.g. 5% by vampire load savings

  const improvements = [
    {
      title: 'Active / Shared Commuting',
      description: 'Switching to public transit or carpooling for 3 days/week.',
      reduction: transportSavings,
      action: 'Set commute goal',
      icon: Footprints,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      title: 'Dietary Adjustments',
      description: 'Opting for meatless meals twice weekly.',
      reduction: dietSavings,
      action: 'Adjust meal plan',
      icon: Flame,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Appliance Power Auditing',
      description: 'Enabling smart plugs and upgrading to LED light fixtures.',
      reduction: energySavings,
      action: 'Check appliances',
      icon: Plus,
      color: 'text-amber-400 bg-amber-500/10',
    },
  ];

  return (
    <div className="glass p-6 hover:border-white/15 transition-all duration-300 h-full flex flex-col justify-between relative">
      <AnimatePresence>
        {toast && (
          <div className="absolute top-4 left-4 right-4 z-50">
            <Toast type={toast.type} message={toast.message} />
          </div>
        )}
      </AnimatePresence>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <h3 className="text-sm font-semibold text-white">Improvement Potential</h3>
        </div>
        
        <div className="space-y-3">
          {improvements.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white leading-normal">{item.title}</h4>
                  <p className="text-[10px] text-dark-400 mt-0.5 leading-snug">{item.description}</p>
                </div>
              </div>
              
              <div className="text-left sm:text-right border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end">
                <span className="text-[10px] text-dark-500 font-semibold sm:hidden">Est. Saving</span>
                <div>
                  <p className="text-xs font-bold text-emerald-400 leading-tight">
                    -{item.reduction} <span className="text-[10px] font-normal">kg/yr</span>
                  </p>
                  <span className="text-[9px] text-dark-500 block">CO₂ reduction</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          className="text-xs font-semibold text-primary-400 hover:text-white flex items-center gap-1.5 transition-colors group"
          onClick={() => showToast('info', 'AI Coach module is being developed in Day 5.')}
        >
          Explore Detailed Recommendations
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
