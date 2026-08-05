# Epic 4 — Architecture Cleanup & Design Readiness Audit

**Status**: AUDIT COMPLETE (Phase 1)
**Date**: 2026-08-04
**Target**: Codebase Cleanliness, Separation of Concerns, and Design System Readiness

---

## 1. Current System Architecture

```
                                  User Input
                                      │
                                      ▼
                             React Page Layer
   (Assessment.tsx, Dashboard.tsx, History.tsx, Community.tsx, Home.tsx, Landing.tsx)
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        State & Context Layer                    UI Component Layer
 (AssessmentContext, AuthContext)      (ui/, calculator/, dashboard/, visualization/)
                   │                                     │
                   ├─────────────────────────────────────┘
                   ▼
         Service & Layer Boundary
(aiCoachService, communityAnalyticsService, seiDatasetService)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
Core Calculation Engine   Firebase Storage Layer
 (src/core/calculation)   (src/firebase/firestore.ts)
 (Pure Math Functions)    (Firestore Collections)
```

---

## 2. Architectural Problems Found

| Issue ID | Category | Location | Severity | Impact |
|---|---|---|---|---|
| **A-4.1** | Component Size | `src/pages/Assessment.tsx` (1,009 lines) | **P1 High** | Monolithic page containing step wizard logic, inline form section sub-components (`TransportSection`, `FoodSection`, `ReviewSection`), input validation (`INPUT_CEILINGS`), and direct persistence calls. |
| **A-4.2** | Legacy Dead Code | `src/context/CalculatorContext.tsx` & `src/App.tsx` | **P1 High** | `CalculatorContext` is a legacy V1 state manager that persists to `localStorage` and `calculations/`. It is 100% superseded by `AssessmentContext` (`/assessment`), but `App.tsx` still wraps `<CalculatorProvider>` around the entire app tree. |
| **A-4.3** | Component Duplication | `src/components/ui/` | **P1 High** | Multiple parallel UI component implementations: `Button.tsx` vs `Button/` directory, `Card.tsx` vs `GlassmorphismCard.tsx` vs `Card/` directory, `StatCard.tsx` vs `StatCard/` directory. |
| **A-4.4** | Layer Boundary Leakage | `src/pages/Assessment.tsx`, `Dashboard.tsx`, `History.tsx` | **P2 Medium** | UI pages invoke `firestore.ts` functions (`saveV2Assessment`, `getUserAssessments`, `getUnifiedUserHistory`, `getCountFromServer`) directly instead of consuming via custom React hooks (`useAssessmentHistory`, `useUserAssessments`). |
| **A-4.5** | Design Token Inconsistency | UI components & pages across `src/pages/` | **P2 Medium** | Styling is split across three paradigms: CSS variables (`var(--bg-card)`), direct inline style tokens (`style={{ background: surface.panel }}`), and ad-hoc Tailwind color classes (`bg-emerald-500/10`, `color="#06b6d4"`). |
| **A-4.6** | AI Rules Directory Missing | `.ai/` root directory | **P2 Medium** | `.ai/` directory (e.g. `.ai/DESIGN_SYSTEM.md`, `.ai/ARCHITECTURE.md`) is absent in the workspace root. |

---

## 3. Detailed Audit Findings

### 3.1 Component Architecture & Responsibilities
- **Assessment Page (`Assessment.tsx`)**: Contains 1009 lines. Handles navigation state, calculation triggers, save error state, field ceiling clamps, and renders step UI inline. Step sections should be extracted into modular, single-responsibility components in `src/components/calculator/`.
- **Community Page (`Community.tsx`)**: Contains 791 lines. Blends Chart.js initialization options, SEI historical survey data processing, map state synchronizers, and leaderboard pagination.
- **Dead Context (`CalculatorContext.tsx`)**: Remains active in `App.tsx` as a provider wrapper despite `/calculator` being deprecated and redirected to `/assessment` in Phase 8.

### 3.2 Business Logic & Calculation Layer
- **Pure Math Separation (`src/core/calculation/`)**: **EXCELLENT**. Sector calculators (`transport.ts`, `energy.ts`, `food.ts`, `waste.ts`, `shopping.ts`, `ecoScore.ts`, `confidence.ts`, `recommendations.ts`, `emissions.ts`) are 100% decoupled from React and DOM APIs.
- **Dataset Registry**: Cleanly isolated under `src/data/datasets/registry/DatasetRegistry.ts`.

### 3.3 Firebase Data Layer
- **Current Flow**: Components directly import Firestore methods:
  - `Assessment.tsx` imports `saveV2Assessment`, `collection`, `getCountFromServer`.
  - `Dashboard.tsx` imports `getUserAssessments`.
  - `History.tsx` imports `getUnifiedUserHistory`, `softDeleteAssessment`, `deleteCalculation`.
- **Recommended Flow**: Wrap data fetching in custom React hooks (e.g., `useAssessmentHistory`, `useLatestAssessment`) to isolate Firebase side-effects from rendering components.

### 3.4 Design System Readiness
- **Token Infrastructure**: `src/design/` contains robust tokens (`colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`, `motion.ts`).
- **Token Adoption**: Incomplete. Several components rely on hardcoded color hex values (`#06b6d4`, `#f59e0b`, `#10b981`) inside JSX props instead of semantic tokens or CSS variables.
- **UI Component Cleanup**: Empty/duplicate directories under `src/components/ui/` (`Accordion`, `Avatar`, `Badge`, `Button`, `CalculatorCard`, `Card`, `Dialog`, `Input`, `InsightCard`, `Modal`, `Progress`, `Skeleton`, `StatCard`, `Tabs`, `Toast`, `Tooltip`) need consolidation into single standard primitives.

### 3.5 Motion & Animation Readiness
- **Token Foundation**: `src/design/motion.ts` defines motion presets (`fadeIn`, `fadeUp`, `stagger`, `cardHover`).
- **Future Enhancements**: Before the major UI redesign, create reusable motion wrapper primitives (e.g., `<FadeIn>`, `<StaggerContainer>`, `<AnimatedNumber>`) to standardize Framer Motion transitions across pages.

---

## 4. Recommended Cleanup Plan

### P0 (Prerequisites for Future Feature Development)
1. **Remove Legacy `CalculatorContext`**: Remove unused `CalculatorProvider` wrapper from `App.tsx` and mark `CalculatorContext.tsx` as deprecated/removed without breaking `/assessment`.
2. **Consolidate Duplicate UI Components**: Clean up empty/duplicate component folders in `src/components/ui/` so that a single component library exists (`Button.tsx`, `Card.tsx`, `Toast.tsx`, `Modal.tsx`).

### P1 (Maintainability & Modularization)
3. **Modularize `Assessment.tsx` Step Sections**: Extract inline `TransportSection`, `FoodSection`, and `ReviewSection` into dedicated files under `src/components/calculator/` with React.memo wrappers.
4. **Extract Custom Firebase Hooks**: Create `useAssessmentHistory` and `useLatestAssessment` hooks to clean up direct Firestore calls inside `Dashboard.tsx` and `History.tsx`.

### P2 (Design System Standardisation)
5. **Standardise Color References**: Replace inline hex values in JSX props with design tokens or CSS variables (`var(--color-primary)`).
6. **Create `.ai/` Guidelines**: Create standard `.ai/` documentation directory for AI guidance prior to UI design phase.

---

## 5. Design Readiness Score

| Metric | Score | Status / Notes |
|---|---|---|
| **Component Architecture** | `7/10` | Modular components exist, but `Assessment.tsx` and `Community.tsx` remain monolithic. |
| **State Management** | `8.5/10` | `AssessmentContext` is robust with draft persistence; legacy `CalculatorContext` needs cleanup. |
| **Business Logic Separation** | `9.5/10` | Core calculation engines and datasets are pure, deterministic, and 100% separated. |
| **Design System Readiness** | `6.5/10` | Tokens exist in `src/design/`, but usage across pages is split between Tailwind, CSS variables, and inline hexes. |
| **OVERALL DESIGN READINESS** | **7.9 / 10** | **Ready for scoped refactor phase before UI redesign.** |

---

## 6. Verification Plan for Refactors
- Run `npm run build` after every task.
- Ensure 0 TypeScript compilation errors.
- Ensure all 7 assessment steps function without regression.
