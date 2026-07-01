import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  score: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ score }) => {
  const radius = 54;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine score color
  let scoreColor = 'stroke-primary-500';
  if (score >= 85) {
    scoreColor = 'stroke-emerald-400';
  } else if (score >= 70) {
    scoreColor = 'stroke-green-400';
  } else if (score >= 50) {
    scoreColor = 'stroke-amber-400';
  } else {
    scoreColor = 'stroke-red-400';
  }

  return (
    <div className="glass p-6 flex flex-col items-center justify-center text-center h-full group hover:border-white/15 transition-all duration-300">
      <span className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-4">Carbon Rating Score</span>
      
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute w-full h-full transform -rotate-90">
          {/* Base track */}
          <circle
            cx="64"
            cy="64"
            r={normalizedRadius}
            className="stroke-white/5"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Animated fill track */}
          <motion.circle
            cx="64"
            cy="64"
            r={normalizedRadius}
            className={scoreColor}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Core Value */}
        <div className="z-10">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-display font-bold text-white block"
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Points</span>
        </div>
      </div>
      
      <span className="text-xs text-dark-400 mt-4 leading-relaxed max-w-[200px]">
        A higher score indicates lower carbon impact.
      </span>
    </div>
  );
};
