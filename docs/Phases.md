# EcoTrack AI — Implementation Phases & Roadmap

This document tracks progress across all implementation phases of the EcoTrack AI overhaul.

---

## Phase Status Summary

| Phase | Description | Status | Progress % | Tests |
| :--- | :--- | :--- | :---: | :---: |
| **Phase 1** | Project Setup, Living Docs & Datasets | **✅ Completed** | 100% | 50 |
| **Phase 2** | Scientific Calculation & Confidence Engine | **✅ Completed** | 100% | 55 |
| **Phase 3** | Adaptive Questionnaire & Location UI | **✅ Completed** | 100% | 55 |
| **Phase 4** | Firestore Storage, History & What-If Simulator | **✅ Completed** | 100% | 55 |
| **Phase 5** | PII-Stripped AI Coach & Newsletter System | **✅ Completed** | 100% | 55 |
| **Phase 6** | Admin Operations Suite, Moderation & Audit | **✅ Completed** | 100% | 55 |
| **Phase 7** | Scientific Datasets Registry & Admin Control Center | **✅ Completed** | 100% | 109 |
| **Phase 8** | UX Consolidation, Data Integrity & Production Polish | **✅ Completed** | 100% | 109 |

---

## Phase Details

### Phase 1: Project Setup, Living Documentation & Datasets
- **Objectives**: Establish `/docs/` living system documentation and modular scientific datasets.
- **Status**: ✅ Completed (100%)
- **Datasets**: CEA (36 State/UT grid factors), ARAI vehicles, ICAO airports, BEE appliances, ICAR food, CPCB waste, UNEP shopping, MoHUA transit.

---

### Phase 2: Scientific Calculation & Confidence Engine
- **Objectives**: Deterministic calculation engine for all 5 sectors with confidence scoring and backward-compatible migration.
- **Files**:
  - [x] `src/utils/calculationEngine.ts` — 5-sector deterministic engine
  - [x] `src/utils/confidenceCalculator.ts` — Precision metrics engine
  - [x] `src/utils/firestoreMigration.ts` — Legacy normalization adapter
  - [x] `src/utils/calculationEngine.test.ts` — 55 tests, 100% pass rate
- **Status**: ✅ Completed. Zero TypeScript errors. 55/55 tests passing.

---

### Phase 3: Adaptive Questionnaire & Location UI
- **Objectives**: India-first location hierarchy, progressive disclosure forms, all scientific component selectors, v2 Assessment page.
- **Files**:
  - [x] `src/components/calculator/LocationSelector.tsx` — State → District → City → Dwelling hierarchy
  - [x] `src/components/calculator/FlightPlanner.tsx` — Haversine distance, cabin class, ICAO factors
  - [x] `src/components/calculator/VehicleSelector.tsx` — ARAI categories, progressive disclosure, occupancy
  - [x] `src/components/calculator/ApplianceSelector.tsx` — BEE Star Rating interactive picker
  - [x] `src/components/calculator/ConfidenceBadge.tsx` — Badge + breakdown card
  - [x] `src/context/AssessmentContext.tsx` — V2 state manager (parallel to legacy CalculatorContext)
  - [x] `src/pages/Assessment.tsx` — Full v2 assessment wizard with Quick/Detailed modes
  - [x] `src/types/rbac.ts` — Full RBAC type system (UserRole, AuditAction, AssessmentDocument)
- **Status**: ✅ Completed. Accessible at `/assessment`.

---

### Phase 4: Firestore Storage, History & What-If Simulator
- **Objectives**: Non-destructive v2 assessment storage, enhanced History page, interactive What-If Simulator.
- **Files**:
  - [x] `src/firebase/firestore.ts` — Extended with `saveV2Assessment`, `getUserAssessments`, `cacheAiAdvice`, `softDeleteAssessment` (all v1 functions preserved intact)
  - [x] `src/components/dashboard/WhatIfSimulator.tsx` — 5 toggleable scenarios with real-time engine recalculation
- **Firestore Schema**:
  - `users/{uid}` — User profiles with RBAC role field
  - `users/{uid}/assessments/{id}` — V2 immutable assessment records
  - `calculations/{id}` — V1 legacy records (untouched)
- **Status**: ✅ Completed. Zero data loss. All v1 collections preserved.

---

### Phase 5: PII-Stripped AI Coach & Newsletter System
- **Objectives**: Gemini-powered personalized recommendations with strict PII removal, verified newsletter subscriptions.
- **Files**:
  - [x] `src/services/aiCoachService.ts` — Anonymized prompt builder, JSON parser, rate limiting, graceful fallback
  - [x] `src/services/newsletterService.ts` — Verified-email-only, disposable domain blocking, unsubscribe tokens
- **Privacy Guarantees**:
  - Name, Email, Phone, UID never sent to Gemini API
  - Only anonymized emission breakdown + state hint + diet hint shared
  - Rate-limited: 1 Gemini call per assessment per hour
  - Fallback: Rule-based recommendations when AI unavailable
- **Status**: ✅ Completed.

---

### Phase 6: Admin Operations Suite, RBAC & Audit Logs
- **Objectives**: Full-featured admin operations center with 7 sections, RBAC guards, immutable audit trail.
- **Files**:
  - [x] `src/pages/admin/AdminDashboard.tsx` — 7-section operations center
  - [x] `src/services/auditService.ts` — Non-crashing fire-and-forget audit log writes
  - [x] `src/components/auth/ProtectedRoute.tsx` — Extended with `requireAdmin` RBAC prop
  - [x] `src/App.tsx` — `/assessment` and `/admin` routes added, AssessmentProvider wrapped
  - [x] `src/components/layout/Navbar.tsx` — Assessment link added for authenticated users
- **Admin Sections**:
  1. Operations Dashboard — Real-time stats, dataset registry
  2. User Management — Search, suspend/unsuspend, role promotion, test account creation
  3. Assessment Moderation — Review queue, approve/reject with audit trail
  4. AI Operations — Config display, PII protection status, cost safeguards
  5. Dataset Manager — Active dataset inspection with version/source metadata
  6. Newsletter Studio — Subscriber list, CSV export, delivery architecture notice
  7. Audit Logs — Full admin action history with timestamps
- **RBAC**: Roles `user` → `moderator` → `admin` → `owner` (least-privilege enforcement)
- **Security**: 403 page shown instead of redirect (prevents URL-guessing attacks)
- **Status**: ✅ Completed. Admin console accessible at `/admin`.

---

### Phase 7: Scientific Datasets Registry & Admin Control Center Expansion
- **Objectives**: Centralize dataset provenance in `DatasetRegistry`, add self-registration addendums to all 9 datasets, provide live admin dataset governance (validate, deprecate, rollback), log AI calls to `ai_logs` collection, and support test account creation, soft-delete, and preference resets.
- **Files**:
  - [x] `src/data/datasets/registry/DatasetRegistry.ts` — Singleton registry class for scientific dataset lifecycle management
  - [x] `src/data/datasets/registry/DatasetRegistry.test.ts` — 23 unit tests for registry methods
  - [x] `src/data/datasets/registry/DatasetRegistry.integration.test.ts` — 31 integration tests verifying all 9 auto-registered datasets
  - [x] `src/services/aiCoachService.ts` — Log call latency, cache hits, failures to `ai_logs`
  - [x] `src/pages/admin/AdminDashboard.tsx` — Live DatasetRegistry controls, AI metrics monitoring, test account creation, user soft-delete & preference reset
- **Status**: ✅ Completed. Zero breaking changes. 109/109 tests passing.

---

### Phase 8: UX Consolidation, Data Integrity & Production Polish
- **Objectives**: Merge Calculator and Assessment into single `/assessment` flow, unify state under `AssessmentContext`, fix numeric input backspace/delete bugs, unify history querying (`getUnifiedUserHistory`), deprecate "High Red Meat" category, improve Newsletter & Footer with verified email pre-fill & disposable domain blocking, implement `bootstrapOwnerAccount` for `jeevansagale9@gmail.com`, add smart conditional skips in Assessment UI, and redesign Dashboard information hierarchy.
- **Files**:
  - [x] `src/App.tsx` — `/calculator` route redirects seamlessly to `/assessment`
  - [x] `src/components/layout/Navbar.tsx` — Single Assessment link in navigation
  - [x] `src/context/AssessmentContext.tsx` — Single source of truth with `assessmentId` tracking
  - [x] `src/firebase/firestore.ts` — `getUnifiedUserHistory` combines v1 and v2 records; `bootstrapOwnerAccount` promotes primary owner safely
  - [x] `src/data/datasets/food/dietaryFactors.ts` — Removed `high_red_meat`, added `other_diet`
  - [x] `src/utils/calculationEngine.ts` — Added backward compatibility mapping for historical `high_red_meat` records
  - [x] `src/pages/Assessment.tsx` — Auto-saves assessment to Firestore, fixed numeric input clearing, added smart skips
  - [x] `src/pages/Dashboard.tsx` — Hero metrics cards, Indian average (2.2t) comparison, previous delta, Category Breakdown, AI Coach, What-If Simulator, Action Plan
  - [x] `src/components/layout/Footer.tsx` — Pre-fills verified user email, blocks disposable domain signups
- **Status**: ✅ Completed. 0 TypeScript compilation errors. 109/109 tests passing.

---

## Final Verification
- **TypeScript**: 0 errors (`npx tsc -b` clean)
- **Tests**: 109/109 passing across 5 test suites
- **Firestore Policy**: Zero data loss — all v1 and v2 collections intact
- **PII Policy**: No personal identifiers ever sent to AI APIs
- **Dataset Registry**: 9/9 scientific datasets auto-registered and validated
- **UX Consolidation**: Single `/assessment` flow, unified `AssessmentContext` state, responsive Dashboard hierarchy


