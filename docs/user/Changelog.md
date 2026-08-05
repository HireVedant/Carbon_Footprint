# EcoTrack AI Changelog

## [1.1.0] - Enterprise Refactor & Security Release
### Added
- Created modular Firebase Cloud Functions (`functions/src/index.ts`) for secure server-side community statistics aggregation.
- Implemented comprehensive User (`/docs/user`) and AI (`/docs/ai`) documentation systems.
- Added `cn()` class utility for clean Tailwind class compositions.
- Added `src/utils/design.ts` design tokens and animation constants.

### Security
- Fixed `firestore.rules` security vulnerability by disabling client-side direct writes to global `communityStats`.
- Replaced hardcoded owner email checks in security rules with Custom Claims and role-based permissions.

### Refactored
- Deconstructed monolithic `Landing.tsx` into clean subcomponents (`Hero.tsx`, `Simulator.tsx`).
- Abstracted aggregation calls in `communityAnalyticsService.ts` to rely on backend function triggers.

## [1.0.0] - Initial Release
- Baseline release featuring carbon calculation engine, multi-step assessment forms, real-time simulator, and dashboard analytics.
