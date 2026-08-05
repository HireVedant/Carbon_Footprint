import { ReactNode } from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

export default function Tabs<T extends string>({ items, value, onChange, className = '' }: TabsProps<T>) {
  return (
    <div
      className={`flex items-center gap-1 rounded-2xl p-1 w-fit surface-elevated ${className}`}
      role="tablist"
      aria-label="Dashboard sections"
    >
      {items.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          aria-selected={value === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
          style={
            value === tab.id
              ? { background: 'var(--color-primary)', color: 'var(--text-on-primary)' }
              : { color: 'var(--text-muted)' }
          }
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
