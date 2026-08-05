import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className = '', id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true">
              <Icon className="w-[18px] h-[18px]" />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all duration-200 ${Icon ? 'pl-11' : 'pl-3.5'} pr-3.5 py-2.5 text-sm rounded-[var(--radius-lg)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-700 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
