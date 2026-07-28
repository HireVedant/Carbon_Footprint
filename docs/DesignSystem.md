# EcoTrack Design System

## Design Philosophy

The EcoTrack design system is modeled after the Assessment page — a dark, science-forward aesthetic with glassmorphism, emerald accents, and clean typography. Every page in the application now inherits from this centralized system.

## Color Palette

### Surface Colors
| Token | Value | Usage |
|-------|-------|-------|
| `surface.base` | `#040d14` | Page background |
| `surface.panel` | `#08141f` | Cards, panels |
| `surface.elevated` | `#0c1f2e` | Elevated elements |
| `surface.glass` | `#0b1922` | Glassmorphism panels |
| `surface.overlay` | `#06101a` | Modals, overlays |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `surface.textPrimary` | `#ffffff` | Headings, key values |
| `surface.textSecondary` | `#8a9c94` | Body text, descriptions |
| `surface.textMuted` | `#5a6e64` | Captions, hints |

### Emerald Scale (Primary)
| Token | Value | Usage |
|-------|-------|-------|
| `emerald[50]` | `#f0fdf9` | Very light accents |
| `emerald[100]` | `#ccfbef` | Light accents |
| `emerald[200] | `#99f6e0` | Light borders |
| `emerald[300]` | `#5eead4` | Hover states |
| `emerald[400]` | `#2dd4bf` | Active elements |
| `emerald[500]` | `#10b981` | Primary actions |
| `emerald[600]` | `#059669` | Primary hover |
| `emerald[700]` | `#047857` | Pressed states |
| `emerald[800]` | `#065f46` | Deep accents |
| `emerald[900]` | `#064e3b` | Darkest accents |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `semantic.success` | `#22C55E` | Success states |
| `semantic.info` | `#0EA5E9` | Information |
| `semantic.warning` | `#F59E0B` | Warnings |
| `semantic.danger` | `#DC2626` | Errors, destructive |

### Category Colors
| Token | Value | Usage |
|-------|-------|-------|
| `carbon.safe` | `#10b981` | Low emissions |
| `carbon.moderate` | `#F59E0B` | Medium emissions |
| `carbon.high` | `#F97316` | High emissions |
| `carbon.danger` | `#DC2626` | Critical emissions |

## Typography

### Font Families
| Token | Value | Usage |
|-------|-------|-------|
| `fontFamily.display` | `'Sora', sans-serif` | Headings, display |
| `fontFamily.body` | `'Inter', sans-serif` | Body text |
| `fontFamily.mono` | `'JetBrains Mono', monospace` | Code, numbers |

### Type Scale
| Name | Size | Weight | Usage |
|------|------|--------|-------|
| Display XL | `text-3xl` to `text-5xl` | `font-bold` | Hero headings |
| Display MD | `text-xl` to `text-2xl` | `font-bold` | Section headings |
| Body LG | `text-lg` | `font-normal` | Intro paragraphs |
| Body | `text-sm` to `text-base` | `font-normal` | Regular text |
| Caption | `text-xs` | `font-semibold` | Labels, metadata |
| Micro | `text-[10px]` to `text-[11px]` | `font-normal` | Fine print |

## Spacing

### Section Spacing
- `section-padding`: `py-16 sm:py-20 lg:py-24`
- Card padding: `p-5 sm:p-6`
- Inner spacing: `space-y-4 to space-y-8`
- Container max-width: `1280px`

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `radius.sm` | `8px` | Small elements |
| `radius.md` | `12px` | Buttons, inputs |
| `radius.lg` | `16px` | Cards |
| `radius.xl` | `20px` | Large cards |
| `radius['2xl']` | `24px` | Feature cards |
| `radius['3xl']` | `24px-32px` | Hero sections |
| `radius.pill` | `999px` | Badges, pills |

## Glassmorphism

```css
/* Primary glass */
.glass {
  background: rgba(11, 25, 34, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Eco green glass */
.glass-eco {
  background: rgba(4, 25, 17, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 24px;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.05), 0 0 32px rgba(16, 185, 129, 0.06);
}
```

## Shadows

```css
box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.05);
box-shadow: 0 0 32px rgba(16, 185, 129, 0.06);
```

## Animations

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `animate-pulse-subtle` | 3s | ease-in-out | Subtle breathing |
| `animate-float-slow` | 6s | ease-in-out | Background elements |
| Hover transitions | 300ms | ease | Cards, buttons |
| Page transitions | 0.5-0.7s | ease-out | Scroll animations |

## Component Variants

### Buttons
- `primary`: Emerald gradient with glow
- `secondary`: Dark glass with border
- `danger`: Red destructive
- Sizes: `sm`, `md`, `lg`

### Cards
- Default: `surface.panel` with `surface.border`
- Glass: `glass` class
- Glass Eco: `glass-eco` class with emerald glow
- Feature: `FeatureCard` with icon, description
- Metric: `StatCard` with value + label

### Badges
- Success: Green with 10% bg
- Warning: Amber with 10% bg
- Danger: Red with 10% bg
- Info: Blue with 10% bg