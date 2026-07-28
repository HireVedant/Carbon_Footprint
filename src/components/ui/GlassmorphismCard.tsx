import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassmorphismCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  /** Strength of the glass effect: 'light' | 'medium' | 'strong' */
  strength?: 'light' | 'medium' | 'strong';
  /** Enable hover lift effect */
  hoverable?: boolean;
}

const strengthStyles = {
  light: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(8px)',
  },
  medium: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
  },
  strong: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(24px)',
  },
};

export function GlassmorphismCard({
  children,
  className = '',
  strength = 'medium',
  hoverable = false,
  ...motionProps
}: GlassmorphismCardProps) {
  return (
    <motion.div
      className={`rounded-2xl ${className}`}
      style={strengthStyles[strength]}
      whileHover={hoverable ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

export default GlassmorphismCard;