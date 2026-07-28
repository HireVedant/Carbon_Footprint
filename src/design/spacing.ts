/**
 * EcoTrack AI — 8-Point Spacing System
 * 
 * Every measurement should be divisible by 8 whenever possible.
 */

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '32px',
  8: '40px',
  9: '48px',
  10: '64px',
  11: '80px',
  12: '96px',
  13: '120px',
  14: '160px',
  15: '240px',
} as const;

export const sectionPadding = {
  large: '160px',
  medium: '120px',
  small: '80px',
} as const;

export const cardPadding = {
  default: '32px',
  compact: '20px',
} as const;

export const grid = {
  maxWidth: '1440px',
  readingWidth: '780px',
  dashboardWidth: '1320px',
  calculatorWidth: '1200px',
  columns: 12,
  gap: '24px',
  margin: {
    desktop: '64px',
    tablet: '40px',
    mobile: '20px',
  },
} as const;