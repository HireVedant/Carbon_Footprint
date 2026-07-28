/**
 * EcoTrack AI — Elevation & Shadow System
 * 
 * Avoid dramatic shadows.
 * Depth is created through contrast.
 */

export const elevation = {
  level0: 'none',                           // Sections
  level1: '0 4px 16px rgba(0, 0, 0, 0.2)',  // Cards
  level2: '0 8px 32px rgba(0, 0, 0, 0.3)',  // Dropdowns, Navigation
  level3: '0 16px 48px rgba(0, 0, 0, 0.4)', // Dialogs, Modals
} as const;

export const ecoGlow = {
  sm: '0 0 25px -5px rgba(16, 185, 129, 0.4)',
  md: '0 0 45px -5px rgba(16, 185, 129, 0.5)',
  mint: '0 0 30px -5px rgba(52, 211, 153, 0.4)',
  glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
} as const;