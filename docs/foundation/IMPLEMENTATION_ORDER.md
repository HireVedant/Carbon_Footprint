# Implementation Order

This document breaks down the major Epics from the Production Execution Plan into granular, verifiable implementation steps.

## Epic 1: Authentication Stabilization
- **Task 1.1: Fix Promise Rejection Handling**
  - **Subtask:** Catch promise rejections in `AuthContext` login/register methods.
  - **Subtask:** Only trigger success toast and navigation if no error was caught.
  - **Verification:** Attempt login with invalid credentials; verify no redirect occurs.
  - **Commit:** `fix(auth): correct promise handling to prevent false success toasts`
- **Task 1.2: Fix Visual Overlap in Inputs**
  - **Subtask:** Replace `absolute top-[38px]` on password toggle with flexbox layout.
  - **Verification:** Check input rendering on mobile width with varying label lengths.
  - **Commit:** `fix(ui): use flexbox for password visibility toggle`

## Epic 2: Firestore Stabilization
- **Task 2.1: Robust `useCommunityStats` Listener**
  - **Subtask:** Add error boundary and fallback mock data if `onSnapshot` throws `permission-denied`.
  - **Subtask:** Implement loading state skeleton until first snapshot resolves.
  - **Verification:** Load community page; verify skeleton shows, then resolves to stats.
  - **Commit:** `fix(firestore): add error handling and skeletons to community stats`

## Epic 3: Assessment Stabilization
- **Task 3.1: Modal Height Constraints**
  - **Subtask:** Apply `max-h-[70vh] overflow-y-auto` to Transport and Food dynamic list containers.
  - **Verification:** Add 10 flights on a mobile view; ensure the "Next" button remains accessible.
  - **Commit:** `fix(assessment): constrain dynamic section height to prevent overflow`
- **Task 3.2: Deconstruct Monolith (Preparation)**
  - **Subtask:** Move inline SVG lists out of `Assessment.tsx` into separate files.
  - **Verification:** `npm run build` succeeds; no behaviour change.
  - **Commit:** `refactor(assessment): extract static layout definitions`

## Epic 4: Design System Enforcement
- **Task 4.1: Purge Hardcoded Colors**
  - **Subtask:** Search for and replace `text-emerald-500` with semantic token variables (e.g. `var(--color-primary)` mapped through Tailwind config).
  - **Verification:** Build succeeds; dark mode colors remain correct.
  - **Commit:** `refactor(design): replace hardcoded colors with tokens`

## Epic 5: UI Primitive Library
- **Task 5.1: Button Primitive**
  - **Subtask:** Implement `<Button>` in `src/components/ui/Button/`.
  - **Subtask:** Add `variant` (primary, secondary, outline) and `size` props.
  - **Verification:** Mount component in a test page or Storybook equivalent.
  - **Commit:** `feat(ui): implement Button primitive`

## Epic 6: Premium SaaS Redesign
- *(Detailed tasks will be generated dynamically once UI primitives are complete).*

## Epic 7: Motion System
- **Task 7.1: Remove Continuous Animations**
  - **Subtask:** Remove `animate-pulse` from backgrounds in `Home` and `Community`.
  - **Verification:** Visual check confirms gradients are static but smooth.
  - **Commit:** `refactor(motion): remove distracting pulse animations`

## Epic 8: Branding
- **Task 8.1: Centralize Application Name**
  - **Subtask:** Replace string literals "EcoTrack AI" with `APP_NAME` from `src/constants/app.ts`.
  - **Verification:** App displays correctly; no layout shifts.
  - **Commit:** `refactor(branding): centralize app name constant`

*(Subsequent epics to be planned dynamically...)*
