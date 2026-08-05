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
  iconColor = 'var(--color-primary)',
  variant = 'default',
  className = '',
  children,
  onClick,
}: CardProps) {
  let IconComponent: LucideIcon | null = null;
  if (icon) {
    if (typeof icon === 'string') {
      const resolved = (Icons as unknown as Record<string, LucideIcon | undefined>)[icon];
      if (resolved) IconComponent = resolved;
    } else {
      IconComponent = icon;
    }
  }

  const paddingClass = variant === 'dashboard' ? 'p-5' : 'p-6 sm:p-8';

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      viewport={viewport}
      onClick={onClick}
      className={`surface-elevated flex flex-col h-full ${paddingClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ borderRadius: radius.lg }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {IconComponent && (
        <div
          className="w-12 h-12 flex items-center justify-center mb-5"
          style={{ borderRadius: radius.md, background: `${iconColor}18`, color: iconColor, border: `1px solid ${iconColor}30` }}
        >
          <IconComponent className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
      {title && (
        <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">{title}</h3>
      )}
      {description && (
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed flex-1">{description}</p>
      )}
      {children}
    </motion.div>
  );
}
