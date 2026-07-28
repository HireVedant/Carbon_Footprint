# EcoTrack Design System Changelog

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