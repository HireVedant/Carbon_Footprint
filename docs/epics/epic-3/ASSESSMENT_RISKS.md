# Assessment System Risk Matrix & Diagnostic Audit

This document details all technical risks, performance bottlenecks, state synchronization flaws, and calculation inconsistencies identified during the Epic 3.1 investigation.

---

## 1. Executive Risk Matrix

| Risk ID | Risk Description | Severity | Location | Root Cause | Impact | Recommended Fix |
|---|---|---|---|---|---|---|
| **R-3.1** | Formula Inconsistency in EcoScore | **P0 Critical** | `Dashboard.tsx:98` vs `Assessment.tsx:111` & `History.tsx:286` | `Dashboard.tsx` uses `100 - totalTonnes * 5.5`, whereas `Assessment.tsx`, `History.tsx`, and `core/calculation/ecoScore.ts` use `100 - totalKg / 100`. | Users see completely different EcoScores on Dashboard (e.g. Score 73) vs Assessment/History (e.g. Score 50) for the exact same footprint. | Standardize `Dashboard.tsx` to use `calculateEcoScore` from `src/core/calculation/ecoScore.ts`. |
| **R-3.2** | Complete Session Data Loss on Refresh | **P0 Critical** | `AssessmentContext.tsx:90` | `answers` state exists only in React memory. No `sessionStorage` or local persistence backup exists. | Refreshing the page mid-assessment wipes all user entries and resets progress back to Step 1. | Add safe `sessionStorage` auto-save & recovery in `AssessmentContext`. |
| **R-3.3** | Monolithic Re-render Cascade | **P1 High** | `Assessment.tsx:43-962` & `AssessmentContext.tsx:147` | Entire 962-line `Assessment.tsx` component and all child sections subscribe directly to monolithic context without memoization. | Every single keypress in any numeric input field re-renders all 7 step components, wizard navigation, and header. | Extract step sections into memoized components and optimize context selectors. |
| **R-3.4** | State Desynchronization (`flights` & `appliances`) | **P1 High** | `AssessmentContext.tsx:97-124` | `flights` and `appliances` maintain duplicate parallel React state (`flightsState` vs `answers.flightDetails`). | Updating flights or appliances requires dual state updates, creating potential synchronization gaps during step navigation. | Consolidate `flightDetails` and `appliances` directly into `AssessmentAnswers` state. |
| **R-3.5** | Unbounded & Negative Input Vulnerability | **P1 High** | `Assessment.tsx:29-34` (`parseNum`) | `parseNum` uses `Math.max(0, n)` but allows absurd values like `1,000,000` km daily transport or `99,999` electricity kWh. | Users can accidentally type extreme numbers causing Infinity / NaN emissions or inflated scores. | Enforce sane ceiling validation bounds per field in `parseNum` or field change handlers. |
| **R-3.6** | Mobile Viewport Form Overflow | **P2 Medium** | `Assessment.tsx:246-267` | Mode toggle buttons and transport multi-select pill containers lack horizontal scrolling on small screens (`320px-375px`). | Buttons wrap awkwardly or clip outside mobile viewports on smaller phones. | Apply flex-wrap and responsive grid layouts with min-touch targets (44px). |
| **R-3.7** | Unhandled Auto-Save Errors | **P2 Medium** | `Assessment.tsx:122-124` | `saveV2Assessment` errors are caught with `console.error` but no user feedback toast is presented. | User receives calculation results on screen but doesn't know their assessment failed to save to Firestore. | Display a non-blocking warning toast if `saveV2Assessment` fails. |

---

## 2. In-Depth Diagnostic Findings

### 2.1 Refresh & Progress Recovery Audit
- **Question 1: Does refreshing during assessment lose progress?**
  - **YES.** `AssessmentContext` initializes `answers` with `initialAssessmentAnswers` on every mount. There is zero `sessionStorage` or `localStorage` caching. A browser refresh at step 6 wipes all data.
- **Question 2: Does logging out/in restore unfinished assessment?**
  - **NO.** Unfinished assessment drafts are not saved to Firestore or associated with user profiles until the final "Calculate Footprint" button is clicked.

### 2.2 Calculation Engine Integrity Audit
- **Question 3: Are calculations deterministic?**
  - **YES.** Core functions in `src/core/calculation/` are pure mathematical routines. Given identical `AssessmentAnswers`, outputs are 100% deterministic.
- **Question 4: Are old assessments still readable?**
  - **YES.** `normalizeAssessmentDocument` in `src/utils/firestoreMigration.ts` normalizes legacy V1 documents and V2 assessment documents into a unified structure.
- **Question 5: Are V1 and V2 calculation paths conflicting?**
  - **NO.** V1 `saveCalculation` writes to `calculations/{id}`; V2 `saveV2Assessment` writes to `users/{uid}/assessments/{id}`. `getUnifiedUserHistory` fetches both and merges them chronologically.
- **Question 6: Does Dashboard display exactly what Assessment saved?**
  - **PARTIALLY BROKEN.** Total emissions and sector breakdowns match, BUT EcoScore calculation on `Dashboard.tsx:98` uses `100 - totalTonnes * 5.5`, whereas `Assessment.tsx:111` uses `100 - totalKg / 100`. This creates a severe score discrepancy between Dashboard and Assessment results.

### 2.3 Performance & Re-render Audit
- **Question 7: Are there unnecessary React renders?**
  - **YES, SEVERE.** Every keystroke in any numeric input calls `updateAnswers`, causing `AssessmentProvider` state to mutate, which triggers a complete re-render of `Assessment.tsx` (962 lines) and all child form sections.
