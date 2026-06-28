import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  iconColor?: string;
}

export default function Card({
  icon: Icon,
  title,
  description,
  children,
  className = '',
  iconColor = 'from-primary-500 to-accent-500',
}: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`card group ${className}`}
    >
      {Icon && (
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-dark-400 leading-relaxed">
        {description}
      </p>
      {children}
    </motion.div>
  );
}
