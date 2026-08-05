interface SkeletonProps {
  className?: string;
}

export function SkeletonBlock({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--border-subtle)] ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`surface-elevated rounded-2xl p-5 ${className}`} aria-hidden="true">
      <div className="h-3 w-2/3 rounded-full bg-[var(--border-subtle)] animate-pulse mb-4" />
      <div className="h-8 w-1/2 rounded-full bg-[var(--border-subtle)] animate-pulse mb-3" />
      <div className="h-2.5 w-3/4 rounded-full bg-[var(--border-subtle)] animate-pulse" />
    </div>
  );
}
