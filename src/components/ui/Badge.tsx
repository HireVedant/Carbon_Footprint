import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'primary' | 'success' | 'neutral' | 'warning';
  className?: string;
}

const toneClasses = {
  primary: 'border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  neutral: 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
};

export default function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
