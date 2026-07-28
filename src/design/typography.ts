/**
 * EcoTrack AI — Typography System
 * 
 * Primary Font: Space Grotesk — Display, Hero, Large Numbers, Titles
 * Secondary Font: Inter — Body, Forms, Descriptions, Navigation, Charts
 */

export const fontFamily = {
  display: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
} as const;

export const fontSize = {
  micro: '12px',
  caption: '14px',
  small: '16px',
  body: '18px',
  cardTitle: '22px',
  subheading: '28px',
  heading: '36px',
  sectionTitle: '48px',
  hero: '72px',
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 1.8,
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;