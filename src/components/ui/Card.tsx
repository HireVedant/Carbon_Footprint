import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cardHover, viewport } from '../../design/motion';
import { radius } from '../../design/radius';

interface CardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon | keyof typeof Icons;
  iconColor?: string;
  variant?: 'default' | 'feature' | 'stat' | 'dashboard';
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export default function Card({
  title,
  description,
  icon,
  iconColor = 'from-emerald-500 to-teal-400',
  variant = 'default',
  className = '',
  children,
  onClick,
}: CardProps) {
  // Resolve string icon names to LucideIcon components
  let IconComponent: LucideIcon | null = null;
  if (icon) {
    if (typeof icon === 'string') {
      const resolved = (Icons as unknown as Record<string, LucideIcon | undefined>)[icon];
      if (resolved) IconComponent = resolved;
    } else {
      IconComponent = icon;
    }
  }

  const baseClasses = variant === 'dashboard'
    ? 'p-5'
    : 'p-6 sm:p-8';

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      viewport={viewport}
      onClick={onClick}
      className={`glass-eco glass-eco-hover flex flex-col h-full ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ borderRadius: radius.lg, ...baseClasses.split(' ').reduce((acc, cls) => ({ ...acc, [cls.startsWith('p-') ? 'padding' : '']: cls.replace('p-', '') }), {}) }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {IconComponent && (
        <div className={`w-14 h-14 flex items-center justify-center mb-5 shadow-lg bg-gradient-to-br ${iconColor}`} style={{ borderRadius: radius.md }}>
          <IconComponent className="w-7 h-7 text-white" aria-hidden="true" />
        </div>
      )}
      {title && (
        <h3 className="font-display text-xl font-bold text-white mb-3">{title}</h3>
      )}
      {description && (
        <p className="text-[15px] text-slate-300 leading-relaxed flex-1">{description}</p>
      )}
      {children}
    </motion.div>
  );
}
