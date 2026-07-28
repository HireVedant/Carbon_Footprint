# EcoTrack AI — System Architecture & Specification

## 1. Overview
EcoTrack AI is a production-quality, scientific, India-first sustainability platform. It enables individuals and organizations in India to accurately measure, analyze, and reduce their carbon footprint using deterministic scientific calculation engines, location-aware grid datasets, progressive adaptive questionnaires, and anonymized AI-driven sustainability coaching.

---

## 2. System Architecture

```
[ Frontend: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion ]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
[ Deterministic Calculation Engine ]         [ Authentication & Storage ]
- CEA Grid Factors (36 States/UTs)          - Firebase Auth (Gmail verified)
- ARAI Vehicle Benchmark Datasets           - Firestore Collections:
- ICAO Airport Distance Engine                 * users (RBAC roles)
- Confidence & Accuracy Engine                 * assessments (versioned)
- Backward Migration Adapter                   * newsletters
        │                                      * audit_logs
        │                                      * datasets
        ▼                                               │
[ PII Sanitizer & Anonymizer ]                          │
(Strips Name, Email, Phone, UID)                         │
        │                                               │
        ▼                                               ▼
[ AI Sustainability Coach ]                 [ Admin Operations Suite ]
- Google Gemini 3.6 API                     - Operations Analytics
- Response Caching                          - User & Test Account Mgr
- Actionable Recommendations                - Assessment Moderation
                                            - Dynamic Dataset Manager
                                            - Newsletter Studio
                                            - Audit Log Viewer
```

---

## 3. Directory Structure & Responsibilities

```
docs/                       # Living System Documentation
  Architecture.md           # Master System Architecture & Specifications
  Memory.md                 # Project Change Log, Decisions & Rollback Instructions
  Phases.md                 # Implementation Phases & Status Dashboard
  Design.md                 # Visual Design System, Typography & UX Principles
  Summary.md                # Quick Context Summary for Next AI Session

src/
  components/               # Reusable UI Components
    auth/                   # Authentication & RBAC Route Guards
    calculator/             # Adaptive Assessment Questionnaire Components
    dashboard/              # User Footprint Analytics & What-If Simulator
    admin/                  # Admin Operations Suite Components
    layout/                 # Navigation, Footer & Layout Structure
    ui/                     # Design System Primitives (Buttons, Cards, Badges)
  context/                  # Global Context Providers (AuthContext, AssessmentContext)
  data/
    providers/              # Data Provider Layer (abstraction over all data sources)
      index.ts              # Central provider exports
      NationalDataProvider.ts      # India national statistics (CEA, MoEFCC, Global Carbon Project)
      StateDataProvider.ts         # Indian state-level environmental data
      CommunityDataProvider.ts     # Community aggregate data
      AssessmentDataProvider.ts    # Assessment-driven data
      EnvironmentalEquivalentProvider.ts  # Indian environmental equivalents (LPG, metro, flights)
      MockProvider.ts              # Mock data for development
    datasets/               # Scientific Datasets (CEA, ARAI, ICAO, BEE)
      electricity/          # CEA India State/UT Electricity Grid Factors
      transport/            # ARAI Vehicle Factors, Airport Engine, Transit
      energy/               # LPG, PNG, Solar & BEE Appliance Star Ratings
      food/                 # Dietary Footprint & Food Waste Multipliers
      waste/                # Segregation, Composting & E-Waste Datasets
      shopping/             # Clothing, Electronics & E-Commerce Datasets
      locations/            # Indian States, UTs, Districts & Cities Registry
  firebase/                 # Firebase Initialization, Auth & Firestore Client
  pages/                    # Application Top-Level Views
    Home.tsx                # Landing page with India map, charts, simulator
    About.tsx               # Methodology, data sources, editorial design
    Assessment.tsx          # 7-step carbon footprint calculator
    Dashboard.tsx           # Visualization-first analytics dashboard
    History.tsx             # Assessment history, reports, PDF export
    Community.tsx           # Leaderboard, eco-forests, challenges
    Admin.tsx               # Admin operations suite
    Login.tsx / Register.tsx  # Authentication
  services/                 # Integration Services (AI Coach, Audit, Newsletter)
  visualization/            # Visualization Architecture (charts, maps, widgets)
    index.ts                # Central visualization exports
    types/
      react-simple-maps.d.ts  # TypeScript declarations for react-simple-maps
    providers/
      VisualizationDataProvider.ts  # Typed data factory for all charts
    charts/
      PremiumRadarChart.tsx   # User vs India vs Community radar
      PremiumDoughnut.tsx     # Emission breakdown with center metric
      PolarTimeline.tsx       # 24-hour emission rhythm polar chart
      TrendChart.tsx          # Line/bar/stacked-bar chart
      GaugeWidget.tsx         # Animated circular gauge
      Sparkline.tsx           # Inline trend sparkline
    maps/
      IndiaMap.tsx            # Interactive SVG India map (7 data layers)
    widgets/
      KPIWidget.tsx           # Metric panel with sparkline and trend
  types/                    # TypeScript Data Models & RBAC Definitions
  hooks/                    # Custom React Hooks
    useAssessmentCalculation.ts  # Assessment calculation engine
  utils/                    # Pure Calculation Engines & Report Generators
  index.css                 # Editorial Design System (t-* tokens, glass-eco, etc.)
```

---

## 4. Visualization Architecture

The visualization system (`src/visualization/`) provides production-quality, data-driven charts and maps that consume typed data from `VisualizationDataProvider`. Components never format raw values internally — formatting belongs inside adapters.

### Components

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| `IndiaMap` | Interactive SVG India map with 7 switchable data layers (participation, eco score, carbon footprint, renewable adoption, grid intensity, transport emissions, household emissions) | `VisualizationDataProvider.getMapLayers()` |
| `PremiumRadarChart` | Radar chart comparing user vs India avg vs community avg | `VisualizationDataProvider.getRadarData()` |
| `PremiumDoughnut` | Doughnut chart with center metric and hover expansion | `VisualizationDataProvider.getDoughnutData()` |
| `PolarTimeline` | Polar area chart showing 24-hour emission rhythm | `VisualizationDataProvider.getPolarTimelineData()` |
| `TrendChart` | Line/bar/stacked-bar chart with premium dark styling | Chart.js with custom adapters |
| `GaugeWidget` | Animated circular gauge with color-coded thresholds | Direct props |
| `Sparkline` | Inline trend sparkline for KPI panels | `VisualizationDataProvider.getSparklineData()` |
| `KPIWidget` | Metric panel with value, trend, sparkline, comparison, status | Direct props |

### Data Flow

```
NationalDataProvider ──┐
StateDataProvider ─────┤
CommunityDataProvider ─┤
AssessmentDataProvider ┤──→ VisualizationDataProvider ──→ Chart Components
                       │                                     │
                       │                                     ▼
                       └───────────────────────────→ Premium UI (glass-eco, dark theme)
```

Switching from mock → government API → Firestore → CSV → JSON requires ZERO component modifications.

---

## 5. Scientific Data & Calculation Architecture

All carbon calculations are 100% deterministic and data-driven. **The AI model never calculates emissions.**

1. **Electricity**: `Emissions = Consumption (kWh) * State_Grid_Factor (kg CO2e/kWh)`
   - Grid emission factors come from the Central Electricity Authority (CEA) CO2 Baseline Database for Indian Power Sector (v19/v20).
2. **Aviation**: Great Circle Distance calculated between ICAO airport coordinates using the Haversine formula + 8% RFI (Radiative Forcing Index) multiplier + cabin class factor (Economy: 1.0, Business: 1.5, First: 2.0).
3. **Vehicles**: Mileage & Fuel Type emissions derived from Automotive Research Association of India (ARAI) & BEE benchmarks.
4. **Appliance Rating Engine**: Energy usage adjustments based on BEE (Bureau of Energy Efficiency) Star Ratings (1-Star to 5-Star Inverter).

### Data Provider Layer (`src/data/providers/`)
The Data Provider Layer provides an abstraction between components and data sources. Components never know where data originates — they consume typed interfaces only. Switching from mock → government API → Firestore → CSV → JSON requires ZERO component modifications.

**Providers:**
- `NationalDataProvider` — India national statistics (per-capita CO₂, population, renewable share) sourced from Global Carbon Project 2024 / IEA India.
- `EnvironmentalEquivalentProvider` — Computes Indian-contextual environmental equivalents (LPG cylinders, metro trips, Delhi–Mumbai flights, tree plantation, rice production, solar units) from government-sourced emission factors.

**Type contracts** (`src/types/dataProviders.ts`):
- `DatasetMetadata` — Source attribution for every dataset.
- `ProviderResponse<T>` — Generic wrapper returning `{ metadata, data }`.
- `IEnvironmentalEquivalentProvider`, `INationalDataProvider`, `IStateDataProvider`, `ICommunityDataProvider`, `IAssessmentDataProvider` — Provider contracts.

### Central Dataset Registry (`DatasetRegistry.ts`)
- All 9 scientific datasets (`electricity_grid`, `transport_vehicles`, `transport_aviation`, `transport_public`, `energy_appliances`, `energy_fuels`, `food_dietary`, `waste_streams`, `shopping_consumer`) self-register on import with the `DatasetRegistry` singleton.
- Manages dataset status (`active`, `deprecated`, `pending_validation`, `rollback`), full provenance metadata, structural validation, and 1-level rollback memory.


---

## 5. Security, RBAC & AI Privacy Architecture

### Role-Based Access Control (RBAC) & Owner Bootstrap
- Roles: `user`, `moderator`, `admin`, `owner`.
- Checked both on client side (via `ProtectedRoute`) and Firestore Security Rules.
- Admin dashboard route `/admin` restricted to `admin` and `owner` roles.
- **Owner Bootstrap Procedure**: During authentication state initialization (`onAuthStateChanged`), the system executes `bootstrapOwnerAccount`. If `jeevansagale9@gmail.com` logs in and no account with `role: 'owner'` exists in Firestore, that account is automatically assigned the `owner` role. If an owner already exists, role promotion is skipped. Plaintext credentials and passwords are never hardcoded or stored.

### PII Sanitization
- Before sending payload to Google Gemini API, the `aiCoachService` strips all PII (Name, Email, Phone, UID, Address).
- Payload contains only:
  - Emission Breakdown (kg CO2/year)
  - Region (State, District)
  - Anonymized lifestyle preferences
  - Confidence rating

---

## 6. Firestore Collections & Schema

### `users/{userId}`
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "user | moderator | admin | owner",
  "isTestAccount": false,
  "isEmailVerified": true,
  "state": "Maharashtra",
  "district": "Mumbai Suburban",
  "city": "Mumbai",
  "createdAt": "timestamp"
}
```

### `users/{userId}/assessments/{assessmentId}`
```json
{
  "id": "string",
  "userId": "string",
  "timestamp": "timestamp",
  "calculatorVersion": "2.0.0",
  "datasetVersion": "2026.1",
  "aiPromptVersion": "1.0",
  "aiModel": "gemini-3.6-flash",
  "mode": "quick | detailed",
  "location": {
    "state": "Maharashtra",
    "district": "Mumbai Suburban",
    "city": "Mumbai",
    "dwelling": "Apartment"
  },
  "emissions": {
    "total": 3450.5,
    "transport": 1200.0,
    "energy": 1400.5,
    "food": 600.0,
    "waste": 150.0,
    "shopping": 100.0
  },
  "confidence": {
    "overall": 92,
    "transport": 95,
    "energy": 98,
    "food": 85,
    "waste": 80,
    "shopping": 75,
    "rationales": ["Exact electricity bill provided"]
  },
  "answers": {},
  "aiAdvice": [],
  "status": "approved | pending_review | rejected"
}
```

### `audit_logs/{logId}`
```json
{
  "id": "string",
  "timestamp": "timestamp",
  "adminUid": "string",
  "adminEmail": "string",
  "action": "DATASET_UPDATE | DATASET_ACTIVATE | DATASET_ROLLBACK | ROLE_CHANGE | USER_SUSPEND | USER_SOFT_DELETE | ASSESSMENT_APPROVE | ASSESSMENT_REJECT | TEST_ACCOUNT_CREATE",
  "target": "string",
  "details": {}
}
```

### `ai_logs/{logId}`
```json
{
  "model": "gemini-1.5-flash",
  "promptVersion": "1.0.0",
  "assessmentId": "string",
  "fromCache": false,
  "latencyMs": 1420,
  "success": true,
  "error": null,
  "timestamp": "timestamp"
}
```

