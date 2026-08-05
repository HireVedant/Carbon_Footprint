# Project Risk Register

## Critical Risks
1. **Authentication State Race Conditions**
   - **Description:** Login flows report failures via toasts despite successful Firebase initialization.
   - **Impact:** High (User trust drops immediately).
   - **Mitigation:** Implement strict promise resolution in `AuthContext` before navigation.
   - **Related Epic:** Epic 1 (Authentication Stabilization).

2. **Community Stats Snapshot Failure**
   - **Description:** Missing documents or Cloud Function failures cause the Community dashboard to infinitely load or crash.
   - **Impact:** High (Core social feature broken).
   - **Mitigation:** Implement robust fallback data and error boundaries; verify Firestore rules.
   - **Related Epic:** Epic 2 (Firestore Stabilization).

## High Risks
1. **Monolithic Architecture in Assessment**
   - **Description:** `Assessment.tsx` is too large and manages too much state.
   - **Impact:** High probability of merge conflicts and regression when modifying specific sections (like Food/Transport).
   - **Mitigation:** Deconstruct into granular `AssessmentProvider` and isolated section components.
   - **Related Epic:** Epic 3 (Assessment Stabilization) & Epic 11 (Architecture Cleanup).

2. **Calculation Engine Duplication**
   - **Description:** Coexistence of `src/core/calculation/` and `src/utils/calculationEngine.ts`.
   - **Impact:** Divergent math logic if a developer uses the wrong import.
   - **Mitigation:** Fully deprecate legacy wrappers.
   - **Related Epic:** Epic 11 (Architecture Cleanup).

## Medium Risks
1. **Design System Bypassing**
   - **Description:** Global use of hardcoded Tailwind classes (e.g., colors, spacing).
   - **Impact:** Prevents rapid re-theming and leads to inconsistent UI.
   - **Mitigation:** Build UI primitives and purge hardcoded values.
   - **Related Epic:** Epic 4 (Design System Enforcement) & Epic 5 (UI Primitive Library).

2. **Assessment Container Overflow**
   - **Description:** Adding dynamic rows in Transport/Food pushes the navigation buttons off-screen.
   - **Impact:** Users cannot proceed to the next step on small screens.
   - **Mitigation:** Implement `overflow-y-auto` and `max-h` constraints.
   - **Related Epic:** Epic 3 (Assessment Stabilization).

## Low Risks
1. **Motion Overload**
   - **Description:** Excessive use of pulse and slide animations.
   - **Impact:** UI feels unpolished.
   - **Mitigation:** Standardize motion tokens.
   - **Related Epic:** Epic 7 (Motion System).
