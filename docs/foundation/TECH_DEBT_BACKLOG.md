# Tech Debt Backlog

## Critical
- **Monolithic State Management:** `Assessment.tsx` handles massive state objects and complex UI logic in one file (~1000 lines). (Epic 3 & 11)
- **Auth Race Conditions:** Login flow reports false failures because promise rejections aren't caught correctly before navigation. (Epic 1)

## High
- **Calculation Engine Duplication:** `src/utils/calculationEngine.ts` (legacy) exists alongside `src/core/calculation/`. Need to deprecate the wrapper. (Epic 11)
- **Hardcoded Firestore Listeners:** `useCommunityStats` lacks error boundaries if `communityStats/global` is missing or rules block it. (Epic 2)

## Medium
- **Design Token Bypassing:** Colors, spacing, and typography are hardcoded with Tailwind strings (e.g., `text-emerald-500`, `text-[10px]`) instead of using centralized design tokens. (Epic 4 & 5)
- **Missing UI Primitives:** Buttons, inputs, and cards are built ad-hoc throughout the app. (Epic 5)
- **Assessment Form Overflow:** Adding elements to Food/Transport dynamic lists pushes navigation out of the viewport on small screens. (Epic 3)

## Low
- **Motion Overload:** Excessive use of `animate-pulse` and uncoordinated page reveals. (Epic 7)
- **Inconsistent Branding:** "EcoTrack AI" vs "EcoTrack" used randomly in text strings. (Epic 8)

## Future
- **Bundle Optimization:** `framer-motion`, `chart.js`, and `firebase` are synchronously loaded. Need to introduce route-level code splitting. (Epic 10)
