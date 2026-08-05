# EcoTrack AI — Memory & Decision Log

## Overview
This document records every major architectural change, feature addition, schema change, migration strategy, breaking change avoidance decision, technical debt item, and rollback instructions for EcoTrack AI.

---

## Change History Log

### Entry 005 — Epic 3: Assessment System Stabilization (Epics 3.1 → 3.2.2)
- **Date**: 2026-08-04
- **Status**: Completed ✅ Closed
- **Scope**: Assessment pipeline reliability — no architecture changes, no schema changes, no calculation formula changes.
- **Changes**:
  - **EcoScore unified** (`Dashboard.tsx`): Replaced isolated `100 - totalTonnes * 5.5` formula with canonical `calculateEcoScore(totalTonnes).score` from `src/core/calculation/ecoScore.ts`. All views (Dashboard, Assessment, History, Cloud Function) now use one source of truth.
  - **Draft persistence added** (`AssessmentContext.tsx`): Implemented `sessionStorage` auto-save on every state mutation. Key: `ecotrack_assessment_draft_v2`. Stores `answers`, `currentStep`, and `mode`. Restores on mount with safe `JSON.parse` error handling. Cleared automatically on `runCalculation()` success or `resetAssessment()`.
  - **Flight state restoration fixed** (`AssessmentContext.tsx`): Added `mapFlightDetailsToEntries()` helper. `flights` state now initializes from `loadDraft()?.answers.flightDetails` so FlightPlanner UI matches calculation state after a browser refresh.
  - **Appliance state restoration fixed** (`AssessmentContext.tsx`): Added `mapAppliancesToUsage()` helper. `appliancesState` now initializes from `loadDraft()?.answers.appliances`. Includes `id` field generation to satisfy strict `ApplianceUsage` TypeScript interface.
  - **Input validation hardened** (`Assessment.tsx`): Added `INPUT_CEILINGS` map and `parseNumClamped()` function. Applied to all numeric fields. Updated limits to Indian household norms: `electricityKWh: 2,000`, `apparelItemsMonthly: 20`.
  - **Assessment re-render optimized** (`Assessment.tsx`): `visibleSteps` and `currentVisibleIndex` wrapped in `useMemo` hooks.
  - **Save failure handling added** (`Assessment.tsx`): Dismissible amber warning banner shown if `saveV2Assessment()` throws, ensuring users know their result wasn't persisted.
- **Files Modified**: `src/pages/Dashboard.tsx`, `src/context/AssessmentContext.tsx`, `src/pages/Assessment.tsx`
- **Files NOT Modified**: All Firestore service files, all `src/core/calculation/` engine files, all dataset files, DatasetRegistry, all test files.
- **Backward Compatibility**: Full. V1 `calculations/{id}` and V2 `users/{uid}/assessments/{id}` documents remain readable and compatible.
- **Build Verification**: `npm run build` → Exit Code 0, 2604 modules, 0 TypeScript errors.
- **Reason**: Eliminate user-facing data loss on refresh, resolve score inconsistency between views, and prevent NaN/Infinity emissions from extreme inputs.
- **Rollback Instructions**: Revert the three file changes listed above. No Firestore migration needed.

---

### Entry 006 — Epic 4.4: Production Stabilization
- **Date**: 2026-08-04
- **Status**: Completed ✅
- **Scope**: Data correctness, calculation consistency, Dashboard functional architecture.
- **Changes**:
  - **EcoScore formula unified (Assessment.tsx)**: Removed the final remaining legacy inline formula (`100 - totalKg/100`) from `Assessment.tsx:135`. Replaced with `calculateEcoScore(computedResult.totalTonnesCO2PerYear).score`. All EcoScore computation now flows through one canonical function: `src/core/calculation/ecoScore.ts`. This affects Assessment, Dashboard, History, and the Community leaderboard pipeline.
  - **Dashboard tab architecture implemented (Dashboard.tsx)**: Added `activeTab` state (`'overview' | 'emissions' | 'goals'`). Added accessible ARIA tab bar with `role="tablist"` / `role="tab"` / `role="tabpanel"`. All pre-computed values (totalKg, ecoScore, breakdown, sparkData, radarData, etc.) are derived once in `Dashboard.tsx` and passed as props to tabs — no duplication.
  - **Missing `answers` field fixed (Dashboard.tsx)**: Firestore hydration `useEffect` previously omitted `answers` from the reconstructed `activeResult` object. InsightCard and ImprovementPreview received `undefined` answers when loading from history. Fixed by adding `answers: latest.answers ?? {}` to the hydrated state.
  - **OverviewTab extracted**: KPI widgets (4), Sustainability Score gauges (Eco Score, Confidence, vs India Avg), InsightCard, EquivalentCard.
  - **EmissionsTab extracted**: PremiumRadarChart, PremiumDoughnut, Category contribution bars, TrendChart (stacked bar). `h-full` replaced with `minHeight: '360px'` on chart containers to prevent grid height collapse.
  - **GoalsTab extracted**: ImprovementPreview (AI coach), WhatIfSimulator, CategoryCard (action plan), ActionButtons (history/report).
- **Files Created**: `src/components/dashboard/tabs/OverviewTab.tsx`, `src/components/dashboard/tabs/EmissionsTab.tsx`, `src/components/dashboard/tabs/GoalsTab.tsx`
- **Files Modified**: `src/pages/Dashboard.tsx` (rewritten), `src/pages/Assessment.tsx` (ecoScore formula + import)
- **Files NOT Modified**: All Firestore service files, all `src/core/calculation/` engine files, all dataset files, `AssessmentContext.tsx`, `firestore.rules`.
- **Backward Compatibility**: Full. No schema changes. V1/V2 data compatibility preserved.
- **Build Verification**: `npm run build` → Exit Code 0, 2607 modules (+3 new tab files), 0 TypeScript errors.
- **Known Remaining Risk**: Community `communityStats/global` and `communityLeaderboard` collections depend on the Cloud Function `onAssessmentCreated` being deployed to Firebase project `eco-track-2833a`. Client-side aggregation is a deliberate no-op stub. If the function is not deployed, community data will not populate. **Must verify via Firebase Console before launch.**- **Root Cause**: Two separate legacy formulas were still present in the persistence/history path (`100 - totalKg/100`) and the Cloud Function fallback path. These diverged from the canonical `calculateEcoScore(totalTonnes)` implementation and led to inconsistent A+/dashboard reporting across refresh and community rehydration.- **Rollback Instructions**: Delete the 3 tab files. Revert `Dashboard.tsx` and `Assessment.tsx` to their previous versions via git. No Firestore migration needed.

---



### Entry 004 — Phase 8: UX Consolidation, Data Integrity & Production Polish
- **Date**: July 25, 2026
- **Status**: Completed
- **Changes**:
  - Merged Calculator and Assessment into a single unified `/assessment` experience; `/calculator` route redirects seamlessly to `/assessment`.
  - Unified state management under `AssessmentContext`, ensuring Assessment, Dashboard, History, and AI Coach consume identical data without desynchronization.
  - Fixed numeric input handling across all forms, supporting Backspace, Delete, clearing (temporary empty state), Ctrl+A, Ctrl+V, and mobile keyboards.
  - Fixed History loading by adding `getUnifiedUserHistory(userId)` in `firestore.ts`, combining v1 legacy calculations and v2 assessments in chronological order with soft-delete support.
  - Removed deprecated "High Red Meat" category from UI, datasets, AI prompts, and calculations, replacing it with `other_diet` and adding backward compatibility mapping for historical Firestore records.
  - Updated Newsletter service & Footer to auto-fill verified user email and reject disposable email domains for guests (`BLOCKED_EMAIL_DOMAINS`).
  - Implemented secure Owner Bootstrap routine `bootstrapOwnerAccount` for `jeevansagale9@gmail.com`.
  - Added smart conditional skips in Assessment UI (e.g. skip cooking fuel & solar panels for Hostel/PG residents).
  - Redesigned Dashboard hierarchy with Hero cards (Annual Footprint, Eco Score, Indian Average comparison, Previous assessment delta, Confidence) followed by Category Breakdown, AI Coach, What-If Simulator, Action Plan, and History timeline.
- **Reason**: Unify fragmented user flows, resolve history storage disconnects, enforce data integrity, and elevate product polish to enterprise SaaS quality.
- **Rollback Instructions**: Revert commit introducing Phase 8 consolidation.

---

### Entry 003 — Phase 7: Scientific Datasets, Dataset Registry & Admin Control Center
- **Date**: July 25, 2026
- **Status**: Completed
- **Changes**:
  - Created `src/data/datasets/registry/DatasetRegistry.ts` singleton pattern for scientific dataset versioning, structural validation, rollback, and status management.
  - Added self-registration blocks to all 9 scientific datasets (`electricity_grid`, `transport_vehicles`, `transport_aviation`, `transport_public`, `energy_appliances`, `energy_fuels`, `food_dietary`, `waste_streams`, `shopping_consumer`).
  - Added unit test suite `DatasetRegistry.test.ts` and integration test suite `DatasetRegistry.integration.test.ts` (109 total tests passing across project).
  - Enhanced `src/services/aiCoachService.ts` with `logAiCall` to track model, latency, cache hit rate, and costs in Firestore `ai_logs`.
  - Expanded `src/pages/admin/AdminDashboard.tsx` with live DatasetRegistry governance, real-time AI metrics, User Management (test accounts, suspend/unsuspend, soft-delete, role changes), Assessment Moderation with notes, Newsletter Studio with CSV export, and Audit Logging.
  - Extended `src/types/rbac.ts` with `USER_SOFT_DELETE`, `USER_PREFERENCES_RESET`, `DATASET_ACTIVATE` audit action types.
- **Reason**: Centralize dataset provenance, provide administrative governance, and ensure complete transparency and observability across AI operations and scientific data.
- **Rollback Instructions**: Revert commit introducing Phase 7 dataset registry and admin enhancements.

---

### Entry 002 — Phase 2: Scientific Calculation & Confidence Engine Implemented
- **Date**: July 25, 2026
- **Status**: Completed
- **Changes**:
  - Implemented `src/utils/confidenceCalculator.ts` for per-category precision scoring (0-100%) and plain-language rationales.
  - Implemented `src/utils/calculationEngine.ts` with zero hardcoded magic numbers, backed by CEA power grid factors (36 States/UTs), ARAI vehicle factors, ICAO Haversine airport distance engine, BEE appliance ratings, ICAR food factors, and CPCB waste benchmarks.
  - Implemented `src/utils/firestoreMigration.ts` as an immutable backward-compatible document normalizer for legacy Firestore records.
  - Built unit test suite `calculationEngine.test.ts` (55 tests passing).
- **Reason**: Establish deterministic scientific rigor and precision accuracy for carbon emission calculations.
- **Rollback Instructions**: Git revert commit introducing Phase 2 engines.

---

### Entry 001 — Master Overhaul & India-First Architecture Initialization
- **Date**: July 25, 2026
- **Status**: Completed
- **Changes**:
  - Initialized `/docs` living documentation suite (`Architecture.md`, `Memory.md`, `Phases.md`, `Design.md`, `Summary.md`).
  - Standardized location selector to India-first (State/UT -> District -> City -> Urban/Rural -> Housing Type).
  - Designed deterministic dataset infrastructure for India (CEA Grid, ARAI Vehicles, ICAO Airport distance engine, BEE star ratings).
  - Defined Role-Based Access Control (RBAC) schema (`user`, `moderator`, `admin`, `owner`).
  - Defined Firestore zero-data-loss migration layer and document versioning (`calculatorVersion`, `datasetVersion`).
  - Defined PII stripping pipeline before calling Gemini API.
- **Reason**: Transition EcoTrack AI from generic calculator to a scientifically grounded, production-grade India-first sustainability SaaS.
- **Rollback Instructions**: Git revert commit establishing `/docs` and dataset directory.
