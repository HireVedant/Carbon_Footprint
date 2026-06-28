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
            className="block text-sm font-medium text-dark-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400">
              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`input-field ${Icon ? 'pl-11' : ''} ${
              error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
