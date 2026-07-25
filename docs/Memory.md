# EcoTrack AI — Memory & Decision Log

## Overview
This document records every major architectural change, feature addition, schema change, migration strategy, breaking change avoidance decision, technical debt item, and rollback instructions for EcoTrack AI.

---

## Change History Log

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
