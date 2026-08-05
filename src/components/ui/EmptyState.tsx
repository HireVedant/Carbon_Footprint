import { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`mx-auto max-w-2xl rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 text-center ${className}`}>
      <div className="mb-4 flex justify-center">{icon}</div>
      <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">{title}</h2>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
