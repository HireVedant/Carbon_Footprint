# Assessment System Fix Plan & Implementation Roadmap

This document outlines the proposed implementation plan for **Epic 3.2 (Assessment System Stabilization)**. Fixes are categorized by priority level (P0 Critical, P1 High, P2 Medium).

---

## 1. Priority Categorization & Roadmap

### P0 Critical (Correctness, Data Integrity & Progress Loss)

#### Fix 3.1: Standardize EcoScore Formula Across Dashboard, Assessment, and History
- **Files Affected**: `src/pages/Dashboard.tsx`
- **Current Behavior**: `Dashboard.tsx:98` calculates `ecoScore = Math.max(1, Math.min(100, Math.round(100 - totalTonnes * 5.5)))`.
- **Problem**: Inconsistent with `Assessment.tsx`, `History.tsx`, `functions/src/index.ts`, and `src/core/calculation/ecoScore.ts` which use `Math.max(0, Math.min(100, Math.round(100 - (totalKg / 100))))`. Users see different scores for the same footprint depending on page view.
- **Proposed Change**: Replace hardcoded formula on `Dashboard.tsx` with `calculateEcoScore(totalKg)` from `src/core/calculation/ecoScore.ts`.
- **Risk Level**: Low.
- **Testing Method**: Compare EcoScore on Assessment completion vs Dashboard vs History for identical input.

#### Fix 3.2: Add Session Auto-Save & Recovery for Draft Assessment
- **Files Affected**: `src/context/AssessmentContext.tsx`
- **Current Behavior**: `answers` state lives solely in React memory and resets to defaults on page refresh.
- **Problem**: User loses all progress if browser is refreshed or accidentally closed mid-assessment.
- **Proposed Change**: Implement `sessionStorage` auto-save inside `AssessmentContext` on answer updates, and restore draft answers on mount if present. Add clear draft action on explicit reset.
- **Risk Level**: Low.
- **Testing Method**: Fill out steps 1-4, refresh browser, verify step and answers are restored.

---

### P1 High (Performance & State Architecture)

#### Fix 3.3: Component Modularization & Memoization
- **Files Affected**: `src/pages/Assessment.tsx`
- **Current Behavior**: Monolithic 962-line file with inline step sub-components (`TransportSection`, `FoodSection`) that re-render entirely on every input keystroke.
- **Problem**: High render latency on low-power devices and mobile viewports.
- **Proposed Change**: Extract step sections (`TransportSection`, `FoodSection`, `EnergySection`, `ReviewSection`) into dedicated memoized component files in `src/components/calculator/`.
- **Risk Level**: Medium.
- **Testing Method**: Verify React DevTools profiler shows 0 unnecessary child renders during typing.

#### Fix 3.4: Consolidate Parallel Flight & Appliance State
- **Files Affected**: `src/context/AssessmentContext.tsx`
- **Current Behavior**: Dual state tracking (`flightsState` / `appliancesState` vs `answers.flightDetails` / `answers.appliances`).
- **Problem**: Potential sync drift when modifying nested arrays.
- **Proposed Change**: Consolidate state directly into `answers.flightDetails` and `answers.appliances`, exposing clean accessor functions.
- **Risk Level**: Low.
- **Testing Method**: Add flight and appliance entries, navigate back and forth, verify payload accuracy.

---

### P2 Medium (Validation & Mobile Polish)

#### Fix 3.5: Input Bound & Ceiling Validation
- **Files Affected**: `src/pages/Assessment.tsx`, `src/components/calculator/*`
- **Current Behavior**: `parseNum` prevents negative numbers (`Math.max(0, n)`) but has no upper bounds.
- **Problem**: Typing `999999` daily km or kWh creates absurd NaN/Infinity emissions.
- **Proposed Change**: Add sane ceiling limits to inputs (e.g., max `1,000` daily km, max `10,000` kWh).
- **Risk Level**: Low.
- **Testing Method**: Attempt typing >10,000 into numeric inputs; verify cap is enforced.

#### Fix 3.6: Non-Blocking Save Failure Notifications
- **Files Affected**: `src/pages/Assessment.tsx`
- **Current Behavior**: `saveV2Assessment` error is caught silently with `console.error`.
- **Problem**: User is unaware if network failure prevented report persistence.
- **Proposed Change**: Display a non-blocking toast notification if auto-save fails while still presenting calculated results.
- **Risk Level**: Low.
- **Testing Method**: Simulate offline save during assessment submission; verify warning toast appears.

---

## 2. Recommended Implementation Order for Epic 3.2

1. **Step 1 (P0)**: Standardize EcoScore formula in `Dashboard.tsx` to match `src/core/calculation/ecoScore.ts`.
2. **Step 2 (P0)**: Implement `sessionStorage` draft recovery in `AssessmentContext.tsx`.
3. **Step 3 (P1)**: Consolidate parallel flight/appliance state in `AssessmentContext.tsx`.
4. **Step 4 (P1)**: Modularize `Assessment.tsx` step sections into memoized components.
5. **Step 5 (P2)**: Add ceiling input validation and non-blocking save error toasts.
6. **Step 6**: Run verification suite (`npm run build`).
