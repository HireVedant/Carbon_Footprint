# Home / Landing Page Architecture

## Design System Integration

The Landing page uses the centralized design system tokens from `src/design/index.ts`.

### Imports
```typescript
import { surface, emerald, fontFamily, radius, semantic, solar, water } from '../design';
import { useCommunityStats } from '../hooks/useCommunityStats';
```

### Key Design Decisions
- All colors reference design tokens, not hardcoded values
- Glassmorphism via `glass` CSS class + `surface.panel` inline styles
- Community stats from `useCommunityStats()` hook (real Firestore data)
- No fake testimonials or fabricated marketing numbers
- Scientific methodology section replaces removed testimonials

## Page Sections
1. **Hero** - Badge + headline + CTA with gradient text
2. **Community Stats** - Live Firestore data (users, reports, CO2, eco score)
3. **Scientific Methodology** - Trust through transparency
4. **Feature Cards** - FeatureCard component with icons
5. **CTA** - Call to action with gradient button

## Removed Content
- ❌ "Trusted by Thousands" section (fake stats)
- ❌ "What Users Are Saying" testimonials (fabricated)
- ❌ All hardcoded marketing numbers