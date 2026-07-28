# Architecture Audit — EcoTrack AI

## Overview

Complete audit of the application architecture, documenting the scientific calculation engine, data pipeline, and all major subsystems.

---

## 1. Core Architecture

### 1.1 Layer Structure

```
src/
├── types/          ← Shared TypeScript types
├── constants/      ← App constants, defaults, routes
├── validation/     ← Input validation
├── core/
│   └── calculation/
│       ├── transport.ts    ← Transport emission calculator
│       ├── energy.ts       ← Energy emission calculator
│       ├── food.ts         ← Food emission calculator
│       ├── waste.ts        ← Waste emission calculator
│       ├── shopping.ts     ← Shopping emission calculator
│       ├── confidence.ts   ← Confidence engine
│       ├── ecoScore.ts     ← Eco score calculator
│       ├── recommendations.ts ← AI recommendation engine
│       ├── emissions.ts    ← Orchestrator
│       └── index.ts        ← Barrel export
├── data/
│   ├── datasets/   ← Scientific datasets (9 sub-datasets)
│   └── configs/    ← UI configuration (transport, food)
├── pages/          ← Page components
├── components/     ← UI components
├── context/        ← React context providers
├── hooks/          ← Custom React hooks
├── services/       ← Firebase/Firestore services
├── utils/          ← Utility functions (legacy)
├── design/         ← Design system tokens
└── visualization/  ← Data visualization
```

### 1.2 Data Flow

```
User Inputs → Validation → Core Calculation → Results
    ↓              ↓              ↓               ↓
  React Form    validateAssessment()   calculateEmissions()    Dashboard
    ↓              ↓              ↓               ↓
  Firestore     Error feedback    Sector breakdown       Charts + Stats
```

---

## 2. Calculation Engine

### 2.1 Entry Point

```typescript
import { calculateEmissions } from '../core/calculation';
const result = calculateEmissions(answers);
```

### 2.2 Module Responsibilities

| Module | Responsibility | Dependencies |
|--------|---------------|-------------|
| `transport.ts` | Vehicle, flight, transit emissions | ARAI data, ICAO |
| `energy.ts` | Electricity, cooking, appliances | CEA grid, BEE |
| `food.ts` | Diet, waste, dining out | ICAR/FAO |
| `waste.ts` | Municipal waste | CPCB |
| `shopping.ts` | Consumer goods | Ecoinvent/WRAP |
| `confidence.ts` | Confidence scoring | Dynamic |
| `ecoScore.ts` | Score + grade | Indian benchmarks |
| `recommendations.ts` | Sustainability tips | Sector breakdown |
| `emissions.ts` | Orchestrator | All calculators |

### 2.3 Backward Compatibility

`src/utils/calculationEngine.ts` re-exports from core modules for backward compatibility. New code should import from `src/core/calculation`.

---

## 3. Data Layer

### 3.1 Datasets (9 sub-datasets)

| Dataset | Records | Source |
|---------|---------|--------|
| Electricity Grid Factors | 36 states/UTs | CEA |
| Vehicle Categories | 15+ categories | ARAI |
| Aviation Airports | 100+ airports | ICAO |
| Public Transit | 5 modes | CSE |
| Cooking Fuels | 4 fuel types | CPCB |
| Appliances | 8 categories × 5 stars | BEE |
| Diet Profiles | 7 diet types | ICAR |
| Waste Factors | Urban/rural | CPCB |
| Shopping Factors | Consumer goods | Ecoinvent |

### 3.2 Dataset Registry

```typescript
import { datasets } from '../data/datasets';
// datasets.meta.version → 'INDIA-SCIENCE-2026.1'
// datasets.electricity → Grid emission factors
// datasets.vehicles → ARAI vehicle categories
```

---

## 4. Design System

### 4.1 Centralized Tokens

```
src/design/
├── colors.ts       ← Color palette
├── typography.ts   ← Font scale
├── spacing.ts      ← Spacing scale
├── shadows.ts      ← Shadow presets
├── radii.ts        ← Border radius
├── gradients.ts    ← Gradient presets
├── animations.ts   ← Animation presets
├── breakpoints.ts  ← Responsive breakpoints
├── zIndex.ts       ← Z-index scale
├── tokens.ts       ← Combined tokens
└── index.ts        ← Barrel export
```

### 4.2 Usage

```typescript
import { colors, typography, spacing } from '../design';
```

---

## 5. Build & Deploy

| Step | Tool | Command |
|------|------|---------|
| Type check | TypeScript | `npx tsc --noEmit` |
| Build | Vite | `npx vite build` |
| Deploy | Vercel | Auto-deploy on push |
| Database | Firestore | Production Firestore |
| Auth | Firebase | Email + Google |

---

## 6. Audit Findings

| Area | Finding | Status |
|------|---------|--------|
| Calculation engine | Centralized in core/ | ✅ |
| Types | Unified in types/assessment.ts | ✅ |
| Design system | Centralized in design/ | ✅ |
| Constants | Centralized in constants/ | ✅ |
| Validation | Centralized in validation/ | ✅ |
| Backward compat | Utils wrapper maintained | ✅ |
| Build | Zero TypeScript errors | ✅ |
| Fake content | Removed | ✅ |