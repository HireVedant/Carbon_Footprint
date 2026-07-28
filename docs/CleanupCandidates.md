# Cleanup Candidates

> **DO NOT DELETE** anything on this list without explicit approval.

## Candidate Components

| Component | File | Reason | Dependencies | Risk | Recommendation |
|-----------|------|--------|-------------|------|----------------|
| Old `Card.tsx` | `src/components/ui/Card.tsx` | Now uses design tokens; may have legacy props | About.tsx, Landing.tsx | Low | Keep - actively used |
| Old `Button.tsx` | `src/components/ui/Button.tsx` | Now uses design tokens | Multiple pages | Low | Keep - actively used |
| `StatCard.tsx` (ui) | `src/components/ui/StatCard.tsx` | Used in About.tsx for stats section | About.tsx | Low | Keep - used in About stats |
| `FeatureCard.tsx` | `src/components/ui/FeatureCard.tsx` | May overlap with Card.tsx | Landing.tsx | Medium | Keep - Landing specific |
| `SectionHeading.tsx` | `src/components/ui/SectionHeading.tsx` | Active in About, Community | About.tsx, Community.tsx | Low | Keep - actively used |
| `CommunityInsightCard.tsx` | `src/components/ui/CommunityInsightCard.tsx` | May be unused after Community redesign | Community.tsx | Medium | Review - check if used |
| `EmissionsBreakdownCard.tsx` | `src/components/ui/EmissionsBreakdownCard.tsx` | May overlap with CategoryCard | Dashboard.tsx | Medium | Review - check usage |
| `ContributionCard.tsx` | `src/components/ui/ContributionCard.tsx` | May be unused | Unknown | Medium | Review - check usage |

## CSS Classes

| Class | Location | Reason | Recommendation |
|-------|----------|--------|----------------|
| `.glass` | `src/index.css` | Still used by Community page, WhatIfSimulator | Keep |
| `.glass-eco` | `src/index.css` | Primary design system class | Keep - core |
| `.btn-primary` | `src/index.css` | Used by Landing CTA links | Keep - needed for Link elements |
| `.btn-secondary` | `src/index.css` | Used by Landing CTA links | Keep - needed for Link elements |
| `.mesh-bg` | `src/index.css` | Background pattern used across all pages | Keep |
| `.gradient-text` | `src/index.css` | Used across all pages | Keep - core |
| `.card` | `src/index.css` | Used by About team cards | Keep - minimal |

## Potential Future Cleanup

- Consider consolidating `glass` and `glass-eco` if all components migrate fully to inline styles
- Consider removing CSS custom properties in `index.css` once all pages use design tokens directly
- `FeatureCard.tsx` could potentially be merged into `Card.tsx` with a `variant` prop