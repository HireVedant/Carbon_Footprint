/**
 * EcoTrack AI — Gradient System
 * 
 * Gradients should be subtle.
 * Use sparingly. Never apply to body text.
 */

export const gradients = {
  forest: 'linear-gradient(135deg, #166534, #22C55E)',
  nature: 'linear-gradient(135deg, #14532D, #4ADE80)',
  river: 'linear-gradient(135deg, #0EA5E9, #22D3EE)',
  sunrise: 'linear-gradient(135deg, #FACC15, #FB923C)',
  night: 'linear-gradient(135deg, #020617, #0F172A)',
  mesh: 'linear-gradient(135deg, #021710 0%, #064e3b 45%, #0f172a 100%)',
  ecoMesh: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.15) 0%, rgba(2,23,16,0.95) 75%)',
  shimmer: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)',
} as const;

export const meshBg = {
  background: `radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
               radial-gradient(ellipse at 80% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%),
               radial-gradient(ellipse at 40% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)`,
} as const;

export const heroGlow = {
  background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
} as const;