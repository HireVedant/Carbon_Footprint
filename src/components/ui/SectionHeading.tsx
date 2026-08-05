import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { viewport } from '../../design/motion';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  children?: ReactNode;
  align?: 'left' | 'center';
}

export default function SectionHeading({
  badge,
  title,
  highlight,
  description,
  children,
  align = 'center',
}: SectionHeadingProps) {
  const alignClasses = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex flex-col ${alignClasses} mb-12 sm:mb-16`}
    >
      {badge && (
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4"
          aria-hidden="true"
        >
          {badge}
        </span>
      )}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-primary text-balance leading-tight ${align === 'center' ? 'max-w-3xl' : ''}`}>
        {title}{' '}
        {highlight && <span className="gradient-text">{highlight}</span>}
      </h2>
      {description && (
        <p className={`mt-4 text-base sm:text-lg text-dark-500 leading-relaxed ${align === 'center' ? 'max-w-2xl' : 'max-w-xl'}`}>
          {description}
        </p>
      )}
      {children}
    </motion.div>
  );
}