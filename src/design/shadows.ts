/**
 * EcoTrack AI — Elevation & Shadow System
 *
 * Premium light theme: depth through soft, low-opacity neutral shadows.
 */

export const elevation = {
  level0: 'none',
  level1: '0 1px 2px rgba(18, 28, 22, 0.05), 0 4px 16px rgba(18, 28, 22, 0.06)',
  level2: '0 2px 4px rgba(18, 28, 22, 0.05), 0 12px 32px rgba(18, 28, 22, 0.10)',
  level3: '0 4px 8px rgba(18, 28, 22, 0.06), 0 24px 48px rgba(18, 28, 22, 0.14)',
} as const;

export const ecoGlow = {
  sm: '0 0 25px -5px rgba(47, 107, 79, 0.18)',
  md: '0 0 45px -5px rgba(47, 107, 79, 0.24)',
  mint: '0 0 30px -5px rgba(108, 142, 120, 0.2)',
  glass: '0 8px 32px 0 rgba(18, 28, 22, 0.08)',
} as const;