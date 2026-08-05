/**
 * EcoTrack AI — Gradient System
 *
 * Gradients should be subtle.
 * Use sparingly. Never apply to body text.
 */

export const gradients = {
  forest: 'linear-gradient(135deg, #2F6B4F, #5F7B6A)',
  nature: 'linear-gradient(135deg, #1F4937, #6C8E78)',
  river: 'linear-gradient(135deg, #2F6FED, #5B8DEF)',
  sunrise: 'linear-gradient(135deg, #D68C2F, #C85A32)',
  night: 'linear-gradient(135deg, #0C1A14, #2E3C36)',
  mesh: 'linear-gradient(135deg, #F6FAF7 0%, #E8F1EB 45%, #F5F4EF 100%)',
  ecoMesh: 'radial-gradient(circle at 50% 0%, rgba(47,107,79,0.08) 0%, rgba(252,251,247,0.98) 75%)',
  shimmer: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
} as const;

export const meshBg = {
  background: `radial-gradient(ellipse at 20% 50%, rgba(47, 107, 79, 0.07) 0%, transparent 50%),
               radial-gradient(ellipse at 80% 20%, rgba(47, 111, 237, 0.05) 0%, transparent 50%),
               radial-gradient(ellipse at 40% 80%, rgba(214, 140, 47, 0.04) 0%, transparent 50%)`,
} as const;

export const heroGlow = {
  background: 'radial-gradient(ellipse at center, rgba(47, 107, 79, 0.12) 0%, transparent 70%)',
} as const;