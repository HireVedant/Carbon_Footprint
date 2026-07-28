/**
 * EcoTrack AI — Brand Color System
 * 
 * Every color communicates meaning.
 * Semantic tokens at the bottom map these to UI usage.
 */

// ─── Primary Brand: Forest ─────────────────────────────────────────────────
export const forest = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#166534',
  800: '#14532d',
  900: '#052e16',
  950: '#022c17',
} as const;

// ─── Secondary Brand: Emerald ──────────────────────────────────────────────
export const emerald = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
} as const;

// ─── Leaf ──────────────────────────────────────────────────────────────────
export const leaf = '#4ADE80';
export const mint = '#BBF7D0';

// ─── Water Palette ─────────────────────────────────────────────────────────
export const water = {
  river: '#0EA5E9',
  lake: '#38BDF8',
  sky: '#7DD3FC',
  mist: '#E0F2FE',
} as const;

// ─── Earth Palette ─────────────────────────────────────────────────────────
export const earth = {
  soil: '#78350F',
  clay: '#92400E',
  sand: '#D6B370',
  stone: '#57534E',
} as const;

// ─── Solar Palette ─────────────────────────────────────────────────────────
export const solar = {
  yellow: '#FACC15',
  sunlight: '#FDE047',
  amber: '#F59E0B',
  orange: '#FB923C',
} as const;

// ─── Carbon Palette ────────────────────────────────────────────────────────
export const carbon = {
  smoke: '#64748B',
  ash: '#475569',
  dark: '#334155',
  danger: '#DC2626',
  critical: '#991B1B',
} as const;

// ─── Neutral / Dark Surface Palette ────────────────────────────────────────
export const surface = {
  night: '#020617',
  base: '#0F172A',
  panel: '#1E293B',
  border: '#334155',
  textSecondary: '#94A3B8',
  textPrimary: '#F8FAFC',
} as const;

// ─── Category Colors (for charts) ─────────────────────────────────────────
export const categoryColors = {
  transport: '#166534',  // Forest
  energy: '#FACC15',     // Solar Yellow
  food: '#4ADE80',       // Leaf
  shopping: '#0EA5E9',   // River
  waste: '#FB923C',      // Orange
  flights: '#DC2626',    // Carbon Red
  home: '#92400E',       // Clay
  neutral: '#64748B',    // Slate Grey
} as const;

// ─── Eco Score Colors ─────────────────────────────────────────────────────
export const ecoScore = {
  excellent: '#047857',   // 90-100 Deep Emerald
  great: '#4ade80',       // 75-89 Leaf Green
  good: '#a3e635',        // 60-74 Yellow Green
  amber: '#f59e0b',       // 45-59 Amber
  high: '#fb923c',        // 25-44 Orange
  critical: '#dc2626',    // 0-24 Red
} as const;

// ─── Carbon Severity Scale ─────────────────────────────────────────────────
export const severity = {
  excellent: '#BBF7D0',  // Mint
  low: '#4ADE80',        // Leaf
  moderate: '#22C55E',   // Emerald
  elevated: '#FACC15',   // Solar Yellow
  high: '#F59E0B',       // Amber
  veryHigh: '#FB923C',   // Orange
  critical: '#DC2626',   // Carbon Red
} as const;

// ─── Semantic Color Tokens ─────────────────────────────────────────────────
export const semantic = {
  success: '#22C55E',
  info: '#0EA5E9',
  warning: '#F59E0B',
  danger: '#DC2626',
  energy: '#FACC15',
  transport: '#166534',
  food: '#4ADE80',
  waste: '#FB923C',
  shopping: '#0EA5E9',
  home: '#92400E',
} as const;