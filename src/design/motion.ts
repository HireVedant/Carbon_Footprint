/**
 * EcoTrack AI — Motion Design System
 * 
 * Motion is communication.
 * Every animation should explain something, reinforce a user's action,
 * or create spatial awareness.
 */

export const duration = {
  ultraFast: 100,    // Button feedback, hover transitions
  fast: 180,         // Cards, tooltips, dropdowns
  medium: 250,       // Navigation, modals, page components
  slow: 400,         // Charts, large transitions, page reveals
  verySlow: 800,     // Background particles, theme evolution
  ambient: 1500,     // Large environmental transitions
} as const;

export const easing = {
  default: 'ease-out',
  inOut: 'ease-in-out',
  smooth: [0.25, 0.1, 0.25, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const;

// Framer Motion animation presets
export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  fadeUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.1 } },
  },
  staggerSlow: {
    animate: { transition: { staggerChildren: 0.15 } },
  },
} as const;

// Card hover micro-interaction
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
  tap: { scale: 0.98 },
};

// Scroll reveal viewport settings
export const viewport = {
  once: true,
  margin: '-50px',
};