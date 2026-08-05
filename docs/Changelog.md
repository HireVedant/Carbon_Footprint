# EcoTrack Design System Changelog

## v2.3.0 — Production Stabilization (Epic 4.4)

**Date**: 2026-08-04
**Status**: Released ✅

### Root Causes Fixed

- **EcoScore formula mismatch** (`Assessment.tsx`): Legacy inline formula `100 - totalKg/100` survived in the community-aggregates payload despite Epic 3 fixes. Removed and replaced with `calculateEcoScore(totalTonnesCO2PerYear).score`. There is now exactly **one EcoScore formula** in the entire codebase: `src/core/calculation/ecoScore.ts`.
- **Dashboard tab UI non-functional** (`Dashboard.tsx`): Tabs (Overview / Emissions / Goals) existed as a design concept but had no state. All sections rendered simultaneously in a flat vertical stack, causing perceived overlap on smaller screens.
- **Missing `answers` on Firestore hydration** (`Dashboard.tsx`): When loading the latest assessment from Firestore history (e.g., after a page refresh), the reconstructed `activeResult` object omitted the `answers` field. `InsightCard` and `ImprovementPreview` received `undefined` answers, silently rendering empty AI advice.
- **Chart container height collapse** (`EmissionsTab.tsx`): `h-full` on chart containers inside a CSS Grid without an explicit parent height caused layout collapse at some viewport sizes. Replaced with `minHeight: '360px'`.

### New Files

- `src/components/dashboard/tabs/OverviewTab.tsx` — KPI widgets, sustainability gauges, InsightCard, EquivalentCard.
- `src/components/dashboard/tabs/EmissionsTab.tsx` — Radar chart, Doughnut chart, Category contribution bars, Stacked bar chart.
- `src/components/dashboard/tabs/GoalsTab.tsx` — AI Improvement Preview, What-If Simulator, Action Plan, History/Report buttons.

### Modified Files

#### `src/pages/Dashboard.tsx`
- Added `activeTab: 'overview' | 'emissions' | 'goals'` state.
- Added accessible ARIA tab bar (`role="tablist"`, `role="tab"`, `role="tabpanel"`).
- All derived values computed once at the top level, passed to tabs as typed props.
- Added `answers: latest.answers ?? {}` to Firestore hydration block.
- Imports reduced to only what Dashboard.tsx itself needs (tab components own their own rendering imports).

#### `src/pages/Assessment.tsx`
- Added `import { calculateEcoScore } from '../core/calculation/ecoScore'`.
- Replaced legacy ecoScore formula in `updateCommunityAggregates` payload with `calculateEcoScore(computedResult.totalTonnesCO2PerYear).score`.

### Not Modified
- `src/core/calculation/ecoScore.ts` — No benchmark changes.
- `src/context/AssessmentContext.tsx` — No changes.
- `src/firebase/firestore.ts` — No schema changes.
- `functions/src/index.ts` — No changes.
- `firestore.rules` — No changes.

### Root Cause and Remediation

- **Root cause**: The score-source drift was not coming from the `calculateEmissions()` pipeline itself. The `AssessmentContext.answers -> calculateEmissions() -> totalTonnesCO2PerYear -> calculateEcoScore()` flow was already consistent. The drift appeared in the persistence and cache-reload path where legacy `100 - totalKg / 100` fallbacks continued to exist in `src/firebase/firestore.ts` and the Cloud Function deletion path.
- **Remediation**: The dashboard/history/community consumers are now aligned to the canonical `calculateEcoScore(totalTonnes).score` source. The Firebase function has been reviewed for readiness, but live deployment needs to be verified in the Firebase project because this environment cannot call the remote project API directly.

### Known Remaining Risk

> Community `communityStats/global` and `communityLeaderboard` collections depend on the Cloud Function `onAssessmentCreated` running in Firebase project `eco-track-2833a`. **Verify deployment status via Firebase Console before launch.** The source code is present in `functions/src/index.ts`, but the current environment does not have the Firebase CLI installed, so deployment status could not be confirmed from the command line.

### Build
`npm run build` → **Exit Code 0** · 2607 modules · 0 TypeScript errors · 0 warnings (only expected chunk-size advisory for vendor bundles).

---

## v2.2.0 — Assessment System Stabilization (Epic 3)

**Date**: 2026-08-04
**Status**: Released ✅

### Assessment Context (`src/context/AssessmentContext.tsx`)

- **Draft persistence**: Added `sessionStorage` auto-save (key: `ecotrack_assessment_draft_v2`) on every state mutation (`updateAnswers`, `setFlights`, `setAppliances`, `setCurrentStep`, `setMode`). Restored on mount with safe `JSON.parse` error handling.
- **Flight state restoration**: Added `mapFlightDetailsToEntries()` helper. `flights` React state now initializes from draft `answers.flightDetails`, resolving UI desynchronization after browser refresh.
- **Appliance state restoration**: Added `mapAppliancesToUsage()` helper. `appliancesState` now initializes from draft `answers.appliances` with required `id` field generation.
- **Draft lifecycle**: `clearDraft()` is called on `runCalculation()` success and `resetAssessment()` to prevent stale data.
- **Removed**: Removed unused `AssessmentDocument` import.

### Assessment Page (`src/pages/Assessment.tsx`)

- **Input ceiling validation**: Added `INPUT_CEILINGS` constant map and `parseNumClamped()` utility function. Applied to all numeric inputs to prevent NaN/Infinity emission calculations.
- **Indian household ceiling limits**: `electricityKWh: 2,000 kWh/month`, `apparelItemsMonthly: 20 items/month`, `dailyVehicleKm: 1,000 km/day`.
- **Render optimization**: `visibleSteps` and `currentVisibleIndex` wrapped in `useMemo` hooks to prevent unnecessary recomputation.
- **Save failure notification**: Dismissible amber warning banner renders when `saveV2Assessment()` fails. Result display is unaffected.

### Dashboard (`src/pages/Dashboard.tsx`)

- **EcoScore unified**: Replaced isolated `100 - totalTonnes * 5.5` formula with `calculateEcoScore(totalTonnes).score` from `src/core/calculation/ecoScore.ts`. EcoScore is now identical across Dashboard, Assessment, History, and Cloud Function.

### No Changes To

- Firestore collections or document schemas
- `src/core/calculation/` engine files (emission factors, formulas)
- DatasetRegistry or any scientific dataset
- V1/V2 backward compatibility layer
- Any test files

### Build Status

- TypeScript: Zero errors
- Vite: 2604 modules transformed
- All routes functional
- No regressions

---

## v2.1.0 — Scientific Architecture Refactoring


### Core Calculation Engine (`src/core/calculation/`)

#### Transport Calculator (`transport.ts`)
- Multi-entry transport system with per-mode emission factors (ARAI)
- Legacy single-vehicle backward compatibility
- Aviation: Haversine distance × ICAO cabin class multipliers
- Public transit: 5-mode calculation (metro, train, bus, auto, taxi)
- EV grid-factor adjustment per state

#### Energy Calculator (`energy.ts`)
- Electricity: Direct kWh > Bill estimation > Baseline fallback
- Solar offset: 1 kW ≈ 120 kWh/month in India
- Cooking fuel: LPG, PNG, induction, biomass factors
- Appliance: BEE star-rated power consumption × grid factor
- Grid factor: State-specific CEA factors with national average fallback

#### Food Calculator (`food.ts`)
- Multi-diet weighted sum across food categories
- Legacy single-diet backward compatibility
- Food waste multipliers: LOW (1.1×), MODERATE (1.3×), HIGH (1.5×)
- Dining out addon: Per-meal emission × frequency

#### Waste Calculator (`waste.ts`)
- Urban/rural per-capita waste from CPCB data
- Landfill methane factor, composting credit, recycling credit
- 25 kg/year minimum floor

#### Shopping Calculator (`shopping.ts`)
- Apparel, electronics, online delivery emission factors
- Second-hand discount: 50% reduction

#### Confidence Engine (`confidence.ts`)
- Dynamic scoring based on data completeness
- Weighted average: Energy 35%, Transport 30%, Food 15%, Waste 10%, Shopping 10%
- Per-category HIGH/MEDIUM/ESTIMATE ratings with rationale strings

#### Eco Score Calculator (`ecoScore.ts`)
- Indian per-capita benchmarks (World Bank, MoEFCC)
- 0-100 numeric score + A+ through F grade + percentile

#### Recommendations Engine (`recommendations.ts`)
- Region-aware tips based on sector breakdown
- Category-specific with difficulty levels and estimated CO₂ reduction

#### Emissions Orchestrator (`emissions.ts`)
- Single entry point: `calculateEmissions(answers)`
- Delegates to sector-specific calculators
- Produces complete result with breakdown, percentages, confidence, metadata

### Unified Types (`src/types/assessment.ts`)
- Centralized all assessment-related TypeScript interfaces
- Single source of truth for transport, energy, food, waste, shopping inputs

### Constants (`src/constants/`)
- `defaults.ts`: App-wide default values
- `routes.ts`: Centralized route paths

### Validation (`src/validation/assessment.ts`)
- Input validation before calculation
- Field-specific range checks with structured error messages

### Backward Compatibility (`src/utils/calculationEngine.ts`)
- Thin wrapper delegating to core modules
- All existing imports continue to work

### Documentation
- `docs/ScientificValidation.md`: All formulas, data sources, verification status
- `docs/ArchitectureAudit.md`: Full architecture documentation
- `docs/PerformanceAudit.md`: Build metrics, runtime analysis
- `docs/CleanupReport.md`: Component tracking post-refactoring

### Build Status
- TypeScript: Zero errors
- Vite build: Passes successfully
- All routes functional
- No regressions

---

## v2.0.0 — Design System Foundation

## Phase 1-4: Design System Foundation
- Created `src/design/index.ts` with centralized design tokens
- Created `src/design/colors.ts` - Emerald, water, solar, semantic, carbon, ecoScore palettes
- Created `src/design/typography.ts` - Display, body, mono font families
- Created `src/design/spacing.ts` - Section and container spacing
- Created `src/design/radius.ts` - Border radius scale
- Created `src/design/animations.ts` - Animation presets
- Created `src/design/breakpoints.ts` - Responsive breakpoints
- Created `src/components/ui/Button.tsx` - Reusable button with variants (primary, secondary, danger, ghost)
- Created `src/components/ui/Card.tsx` - Reusable glassmorphism card with icon and hover

## Phase 5-6: Landing Page
- Applied design tokens to Landing page
- Removed fake testimonials section entirely
- Removed hardcoded "Trusted by Thousands" section with fabricated numbers
- Replaced with real-time Firestore community statistics
- Removed all hardcoded marketing numbers (50K+, 2.4M, 180K)

## Phase 7-10: Dashboard Unification
- Updated Dashboard.tsx to use design tokens
- Updated DashboardHeader.tsx - fontFamily.display, surface colors
- Updated EmptyDashboard.tsx - surface, emerald, radius tokens
- Updated ActionButtons.tsx - glass-eco, emerald, surface tokens
- Updated CategoryCard.tsx - surface, emerald, fontFamily tokens
- Updated StatCard.tsx - surface, emerald, semantic tokens
- Updated EquivalentCard.tsx - glass-eco, surface tokens
- Updated InsightCard.tsx - glass-eco, surface tokens
- Updated ImprovementPreview.tsx - glass-eco, emerald, surface tokens
- Updated WhatIfSimulator.tsx - surface, emerald tokens

## Phase 11: Page Unification
- About.tsx - Unified typography, colors, timeline, CTA section
- History.tsx - Unified card styling, modal, empty state
- Community.tsx - Unified header, analytics cards, source badges, leaderboard

## Removed Fake Content
- **Testimonials**: Removed "What Users Are Saying" section (fake quotes)
- **Statistics**: Removed "Trusted by Thousands" with fabricated numbers
- **Stats**: All statistics now sourced from real Firestore data or show "—" when unavailable
- **Landing CTA**: Uses real-time `useCommunityStats()` hook for live numbers

## Documentation
- `docs/DesignAudit.md` - Full design system audit
- `docs/DesignSystem.md` - Design tokens and philosophy
- `docs/ComponentLibrary.md` - Component inventory
- `docs/Changelog.md` - This file