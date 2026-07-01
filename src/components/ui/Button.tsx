import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

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
  primary: `bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold 
            shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 
            hover:from-primary-500 hover:to-primary-400`,
  secondary: `bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold 
              hover:bg-white/10 hover:border-white/20`,
  ghost: `text-dark-300 font-medium hover:text-white hover:bg-white/5`,
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl 
                  transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed
                  ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...(props as any)}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
