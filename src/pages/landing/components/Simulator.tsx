import React from 'react';
import { motion } from 'framer-motion';
import { TOKENS, staggerContainer, fadeInUp } from '../../../utils/design';
import { cn } from '../../../utils/cn';

interface SimulatorProps {
  carbonScore: number;
  carbonRating: string;
  sliders: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    description: string;
    color: string;
    weight: number;
  }>;
  onSliderChange: (id: string, value: number) => void;
  onNavigate: (path: string) => void;
}

export const Simulator: React.FC<SimulatorProps> = ({ carbonScore, carbonRating, sliders, onSliderChange, onNavigate }) => {
  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-5">
        {sliders.map((slider) => (
          <motion.div
            key={slider.id}
            variants={fadeInUp}
            className={cn("glass-eco rounded-2xl p-5 hover:border-primary-200 transition-all duration-300")}
          >
            <div className="flex items-center gap-4">
              <div className={cn(`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0 ${slider.color} text-white shadow-lg`)}>
                {slider.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: TOKENS.text.primary }}>{slider.label}</span>
                  <span className="text-sm font-medium" style={{ color: TOKENS.color.primary }}>
                    {slider.value} {slider.unit}
                  </span>
                </div>
                <p className="text-xs mb-3" style={{ color: TOKENS.text.muted }}>{slider.description}</p>
                <div className="relative">
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) => onSliderChange(slider.id, parseFloat(e.target.value))}
                    className="eco-range-slider w-full"
                    aria-label={`Adjust ${slider.label}`}
                    aria-valuenow={slider.value}
                    aria-valuemin={slider.min}
                    aria-valuemax={slider.max}
                  />
                  <div className="flex justify-between text-[10px] mt-1" style={{ color: TOKENS.text.muted }}>
                    <span>{slider.min}</span>
                    <span>{slider.max}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeInUp} className="lg:sticky lg:top-28">
        <div className="glass-eco rounded-3xl p-8 text-center">
          <p className="t-label-lg mb-3" style={{ color: TOKENS.text.tertiary }}>Your Annual Estimate</p>
          <div className="text-6xl font-bold gradient-text mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {carbonScore.toLocaleString()}
          </div>
          <p className="text-lg mb-6" style={{ color: TOKENS.text.secondary }}>kg CO₂e / year</p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(13,202,140,0.08) 100%)',
              borderColor: 'rgba(16,185,129,0.25)',
            }}>
            <span className="text-3xl font-bold" style={{ color: TOKENS.color.primary }}>{carbonRating}</span>
            <span className="text-sm" style={{ color: TOKENS.text.secondary }}>Rating</span>
          </div>

          <button
            onClick={() => onNavigate('/register')}
            className={cn("btn-primary w-full justify-center")}
          >
            Save & Track Progress
          </button>
          <p className="text-xs mt-4" style={{ color: TOKENS.text.muted }}>Free forever. No credit card needed.</p>
        </div>
      </motion.div>
    </div>
  );
};
