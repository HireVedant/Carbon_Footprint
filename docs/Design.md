# EcoTrack AI — Design System & Interaction Guidelines

## Design Philosophy
EcoTrack AI follows a modern, calm, premium, and minimal aesthetic inspired by leading SaaS interfaces (Stripe, Linear, Vercel, Notion, Apple). It prioritizes high legibility, generous spacing, thoughtful hierarchy, subtle glassmorphic textures, and elegant micro-animations.

---

## 1. Color System

### Dark Mode (Primary Palette)
- **Background Core**: `#090D16` (Deep Slate / Emerald Tinted Obsidian)
- **Surface Elevation 1**: `#111827` (Card Surface)
- **Surface Elevation 2**: `#1F2937` (Hover State / Sub-card)
- **Border Subtle**: `rgba(255, 255, 255, 0.08)`
- **Border Accent**: `rgba(16, 185, 129, 0.3)` (Emerald Glow)

### Brand & Category Accents
- **Primary Eco Emerald**: `#10B981` (Main CTA, High Confidence, Positive Savings)
- **Transport Cyan**: `#06B6D4` (Aviation, Vehicles, Transit)
- **Energy Amber**: `#F59E0B` (Electricity, Cooking Gas, Appliances)
- **Food Rose**: `#F43F5E` (Diets, Dining Out, Food Waste)
- **Waste Violet**: `#8B5CF6` (Solid Waste, Composting, E-Waste)
- **Shopping Indigo**: `#6366F1` (Consumer Goods, E-Commerce)

---

## 2. Typography

- **Font Family**: Inter, system-ui, -apple-system, sans-serif
- **Headings**: Semibold / Bold with letter-spacing `-0.02em`
- **Body**: Regular (400) / Medium (500) with line-height `1.6`
- **Data / Metrics**: Monospace numerals (`font-mono`) for numerical precision

---

## 3. Component Design System

### Cards
- Rounded corners (`rounded-2xl` / `16px`)
- Soft inner border (`border border-white/10`)
- Subtle backdrop blur (`backdrop-blur-md bg-gray-900/80`)
- Hover lift animation (`translate-y-[-2px]` with Framer Motion)

### Confidence Badges
- **High Confidence (85% - 100%)**: Emerald green badge with check icon
- **Medium Confidence (65% - 84%)**: Amber badge with alert icon
- **Estimate Level (< 65%)**: Blue / Slate badge with info icon

### Forms & Selectors
- Large tap targets (`py-3 px-4`, minimum height `48px`)
- Clear focus states with emerald glow ring (`focus:ring-2 focus:ring-emerald-500/50`)
- Progressive disclosure: secondary inputs revealed smoothly with scale & opacity transitions

---

## 4. Animation Guidelines

- **Framer Motion**:
  - Page transitions: `opacity: 0 -> 1`, `y: 10 -> 0` (duration 0.3s easeOut)
  - Modal overlay: backdrop fade 0.2s, content scale `0.95 -> 1`
  - Dynamic list insertion: staggered layout animations (`layout` prop)
- **Anime.js**:
  - Used for dynamic counter updates (e.g. total footprint number count-up on calculation completion)
  - Landing page hero background SVG wave dynamics
- **Accessibility**:
  - All animations respect `prefers-reduced-motion: reduce`.

---

## 5. Admin Operations Control Center UI System

- **Layout**: Fixed sidebar navigation (`w-64 bg-gray-900/80 border-r border-white/10`) + full-screen main content view with smooth tab switching.
- **Section Badges**:
  - `active` / `approved`: Emerald green background pill (`bg-emerald-500/20 text-emerald-400`)
  - `deprecated` / `flagged` / `pending`: Amber background pill (`bg-amber-500/20 text-amber-400`)
  - `rejected` / `suspended`: Red background pill (`bg-red-500/20 text-red-400`)
  - `TEST ACCOUNT`: Indigo bold tag (`bg-indigo-500/20 text-indigo-400 border border-indigo-500/30`)
- **Data Governance Panel**: Live `DatasetRegistry` status indicators with immediate action buttons (Validate, Deprecate, Rollback).

