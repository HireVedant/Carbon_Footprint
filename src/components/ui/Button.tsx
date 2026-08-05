import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { radius, duration } from '../../design';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

const variantClasses = {
  primary: 'bg-[var(--color-primary)] text-[#03120a] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.45)] hover:bg-[color:var(--color-accent)]',
  secondary: 'bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] font-semibold hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]',
  ghost: 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative inline-flex items-center justify-center gap-2 border-none outline-none
                  transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed
                  focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
                  ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={{ borderRadius: radius.pill }}
      disabled={isLoading || props.disabled}
      {...(props as any)}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
