/**
 * EcoTrack AI — Brand Color System
 *
 * Premium Climate Intelligence Platform for India.
 * Editorial, data-first, scientific. Restrained color.
 * Every value is a semantic token consumed via CSS variables or direct import.
 */

// ─── Primary Brand: Deep Forest Green ───────────────────────────────────────
export const forest = {
  50: '#F6FAF7',
  100: '#E8F1EB',
  200: '#C9DCCD',
  300: '#A7C0AF',
  400: '#779C84',
  500: '#2F6B4F',
  600: '#24563F',
  700: '#1F4937',
  800: '#183A2B',
  900: '#11281D',
  950: '#0C1A14',
} as const;

// ─── Secondary Brand: Sage / Bio ────────────────────────────────────────────
export const emerald = {
  50: '#F4F6F3',
  100: '#E7EAE4',
  200: '#D1D7D0',
  300: '#B8C0B8',
  400: '#99A89D',
  500: '#5F7B6A',
  600: '#4E6758',
  700: '#3E5147',
  800: '#2E3C36',
  900: '#1B2520',
  950: '#0F1713',
} as const;

// ─── Halo / Accent ─────────────────────────────────────────────────────────
export const leaf = '#2F6B4F';
export const mint = '#6C8E78';

// ─── Water Palette ─────────────────────────────────────────────────────────
export const water = {
  river: '#2F6FED',
  lake: '#5B8DEF',
  sky: '#DCE8F7',
  mist: '#F5F4EF',
} as const;

// ─── Earth Palette ─────────────────────────────────────────────────────────
export const earth = {
  soil: '#A66F40',
  clay: '#C39263',
  sand: '#F2EEDC',
  stone: '#D7D9D4',
} as const;

// ─── Solar Palette ─────────────────────────────────────────────────────────
export const solar = {
  yellow: '#D68C2F',
  sunlight: '#F2D7A7',
  amber: '#C85A32',
  orange: '#D68C2F',
} as const;

// ─── Carbon Palette ────────────────────────────────────────────────────────
export const carbon = {
  smoke: '#6A736D',
  ash: '#75827A',
  dark: '#121C16',
  danger: '#C85A32',
  critical: '#A8482A',
} as const;

// ─── Light Surface Palette (Premium Climate Intelligence) ──────────────────
// Every key kept for backward compatibility — values now map to the light system.
export const surface = {
  night: '#FFFFFF',
  base: '#FCFBF7',
  panel: '#FFFFFF',
  elevated: '#F5F4EF',
  hover: '#F1F0EA',
  border: '#E7E4DD',
  textPrimary: '#121C16',
  textSecondary: '#465148',
  textTertiary: '#687268',
} as const;

// ─── Category Colors (for charts) ─────────────────────────────────────────
export const categoryColors = {
  transport: '#2F6FED',
  energy: '#D68C2F',
  food: '#2F6B4F',
  shopping: '#5F7B6A',
  waste: '#C85A32',
  flights: '#A8482A',
  home: '#A66F40',
  neutral: '#6A736D',
} as const;

// ─── Eco Score Colors ─────────────────────────────────────────────────────
export const ecoScore = {
  excellent: '#2F6B4F',
  great: '#4E6758',
  good: '#6C8E78',
  amber: '#D68C2F',
  high: '#C85A32',
  critical: '#A8482A',
} as const;

// ─── Carbon Severity Scale ─────────────────────────────────────────────────
export const severity = {
  excellent: '#2F6B4F',
  low: '#4E6758',
  moderate: '#6C8E78',
  elevated: '#D68C2F',
  high: '#C85A32',
  veryHigh: '#A8482A',
  critical: '#7C3420',
} as const;

// ─── Semantic Color Tokens ─────────────────────────────────────────────────
export const semantic = {
  success: '#2F6B4F',
  info: '#2F6FED',
  warning: '#D68C2F',
  danger: '#C85A32',
  energy: '#D68C2F',
  transport: '#2F6FED',
  food: '#2F6B4F',
  waste: '#C85A32',
  shopping: '#5F7B6A',
  home: '#A66F40',
} as const;