# EcoTrack AI      

EcoTrack AI is a modern carbon footprint assessment platform that enables individuals to measure, understand, and reduce their environmental impact through scientifically derived emission calculations, adaptive assessments, historical analytics, and personalized sustainability recommendations.

The platform combines a data-driven carbon calculation engine with an intuitive user experience to transform complex environmental data into practical actions for everyday users.

----

## Live Demo

<https://eco-track-platform.vercel.app/>

----

## Overview

Climate change mitigation begins with understanding personal emissions. EcoTrack AI provides an accessible way for users to estimate their annual carbon footprint across major lifestyle categories while maintaining transparency in the underlying calculations.

Unlike simple calculators that provide only a single emissions number, EcoTrack AI offers:

- Category-wise emission analysis
- Scientific confidence estimation
- Historical assessment tracking
- AI-generated sustainability recommendations
- Interactive "What-If" simulations
- Downloadable assessment reports

The project was developed as a Software Engineering Mini Project and demonstrates the application of modern frontend engineering, cloud services, data visualization, and sustainable computing concepts.

----

## Core Features

### Carbon Footprint Assessment

A guided adaptive questionnaire collects lifestyle information and estimates annual greenhouse gas emissions across multiple categories including:

- Transportation
- Household Energy
- Food & Diet
- Waste Management
- Consumer Shopping

The questionnaire dynamically adapts based on previous responses, reducing unnecessary inputs and improving user experience.

----

### Scientific Calculation Engine

EcoTrack AI implements a modular calculation engine that combines multiple emission factors and scientific datasets to estimate annual CO₂ equivalent emissions.

Features include:

- Category-based emission modelling
- Regional electricity emission factors (CEA 36 States/UTs)
- Transportation-specific calculations (ARAI benchmarks)
- Household energy estimation
- Food impact modelling
- Confidence scoring
- Versioned calculation engine

----

### Data Provider Layer

The application implements a **Data Provider Layer** (`src/data/providers/`) that abstracts data sources from components. Components never know where data originates — they consume typed interfaces only.

**Key Providers:**
- `NationalDataProvider` — India national statistics (per-capita CO₂, population, renewable share) sourced from Global Carbon Project 2024 / IEA India.
- `EnvironmentalEquivalentProvider` — Computes Indian-contextual environmental equivalents (LPG cylinders, metro trips, Delhi–Mumbai flights, tree plantation, rice production, solar units) from government-sourced emission factors.

**Type Contracts** (`src/types/dataProviders.ts`):
- `DatasetMetadata` — Source attribution for every dataset.
- `ProviderResponse<T>` — Generic wrapper returning `{ metadata, data }`.
- `IEnvironmentalEquivalentProvider`, `INationalDataProvider` — Provider contracts.

Switching data sources (mock → government API → Firestore → CSV → JSON) requires **ZERO component modifications**.

----

### Personalized Dashboard

Every completed assessment generates a comprehensive dashboard containing:

- Annual Carbon Footprint
- Eco Score
- Scientific Confidence Score
- Indian Average Comparison
- Category Breakdown
- Historical Trend Analysis
- AI Sustainability Insights
- What-If Simulator
- Action Recommendations

----

### AI Sustainability Coach

EcoTrack AI provides contextual sustainability recommendations generated from assessment results.

Recommendations focus on:

- Transportation improvements
- Energy optimization
- Household efficiency
- Sustainable food choices
- Waste reduction

The AI system operates only on assessment data and never requires unnecessary personal information.

----

### Historical Tracking

Authenticated users can maintain a complete history of previous assessments.

Features include:

- Chronological assessment history
- Previous assessment comparison
- Historical trend visualization
- Emission progression tracking

----

### Visualization Architecture

The platform includes a comprehensive visualization system (`src/visualization/`) with production-quality, data-driven charts and maps:

| Component | Purpose |
|-----------|---------|
| `IndiaMap` | Interactive SVG India map with 7 switchable data layers (participation, eco score, carbon footprint, renewable adoption, grid intensity, transport, household emissions) |
| `PremiumRadarChart` | Radar chart comparing user vs India avg vs community avg |
| `PremiumDoughnut` | Doughnut chart with center metric and hover expansion |
| `PolarTimeline` | Polar area chart showing 24-hour emission rhythm |
| `TrendChart` | Line/bar/stacked-bar chart with premium dark styling |
| `GaugeWidget` | Animated circular gauge with color-coded thresholds |
| `Sparkline` | Inline trend sparkline for KPI panels |
| `KPIWidget` | Metric panel with value, trend, sparkline, comparison, status indicator |

All visualizations consume typed data from `VisualizationDataProvider` and follow the editorial dark-theme design system.

----

### Scientific PDF Reports

Users can export assessment results as professionally formatted PDF reports containing:

- Executive Summary
- Emission Breakdown
- Category Analysis
- AI Recommendations
- Scientific Metadata
- Confidence Information

----

### Community Features

EcoTrack AI also includes community-focused functionality including:

- Community Statistics
- Leaderboards
- Sustainability Participation Metrics

----

## Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React 19, TypeScript |
| Routing | React Router v7 |
| Styling | Tailwind CSS 3.4 + Editorial Design System |
| Animations | Framer Motion 12 |
| Charts | Chart.js 4, react-chartjs-2, react-simple-maps |
| Maps | react-simple-maps (SVG India map with 30 state choropleth) |
| Authentication | Firebase Authentication 11 |
| Database | Cloud Firestore 11 |
| PDF Generation | jsPDF, jsPDF-AutoTable, html2canvas, @react-pdf/renderer |
| Build Tool | Vite 6.4 |
| Language | TypeScript 5.8 |

----

## Architecture

```
User
   │
   ▼
Adaptive Assessment
   │
   ▼
Scientific Calculation Engine
   │
   ├────────► Confidence Engine
   │
   ├────────► Dataset Registry
   │
   ▼
Assessment Result
   │
   ├────────► Dashboard
   ├────────► AI Coach
   ├────────► What-If Simulator
   ├────────► History
   └────────► PDF Report
```

----

## Project Structure

```text
src/
├── components/
│   ├── auth/              # Route guards, RBAC
│   ├── calculator/        # Assessment question UI
│   ├── dashboard/         # Dashboard sub-components
│   ├── layout/            # Navbar, Footer, Layout
│   └── ui/                # Design system primitives
│
├── context/
│   ├── AuthContext        # Firebase Auth + role management
│   └── AssessmentContext  # Multi-step assessment state
│
├── data/
│   ├── providers/         # Data Provider Layer (abstraction)
│   │   ├── NationalDataProvider.ts
│   │   ├── EnvironmentalEquivalentProvider.ts
│   │   ├── StateDataProvider.ts
│   │   ├── CommunityDataProvider.ts
│   │   └── MockProvider.ts
│   └── datasets/          # Scientific datasets (CEA, ARAI, BEE)
│
├── firebase/              # Firebase config, auth, Firestore CRUD
├── hooks/                 # Custom hooks (useAssessmentCalculation)
├── pages/                 # Top-level views (Home, Assessment, Dashboard, etc.)
├── services/              # AI Coach, Audit, Newsletter services
├── types/                 # TypeScript models & data provider contracts
├── utils/                 # Pure calculation engines & PDF generators
│
├── visualization/         # Visualization Architecture
│   ├── charts/            # PremiumRadarChart, PremiumDoughnut, TrendChart, etc.
│   ├── maps/              # IndiaMap (SVG choropleth)
│   ├── widgets/           # KPIWidget, GaugeWidget, Sparkline
│   └── providers/         # VisualizationDataProvider
│
└── index.css              # Editorial Design System (t-* tokens, glass-eco, etc.)
```

The project follows a modular architecture that separates user interface components, business logic, scientific calculations, Firebase services, datasets, visualization, and application state management.

----

## Installation

Clone the repository

```bash
git clone https://github.com/HireVedant/Carbon_Footprint.git
```

Navigate into the project

```bash
cd Carbon_Footprint
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
...
```

Start the development server

```bash
npm run dev
```

---

## Available Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Execute test suite
```

---

## Key Capabilities

- Adaptive assessment workflow
- Scientific emission calculations
- Versioned calculation engine
- Dataset-driven architecture
- Historical assessment management
- Interactive analytics
- AI-powered sustainability guidance
- PDF report generation
- Community engagement features
- Responsive interface

----

## Project Status

Current Version

```
Architecture            2.0.0
Calculation Engine      2.0.0
Dataset Registry        1.0.0
```

Implemented Components

- Adaptive Assessment
- Scientific Calculation Engine
- Dataset Registry
- Dashboard
- Historical Tracking
- AI Coach
- Community Features
- PDF Report Generation
- Newsletter System
- Administrative Dashboard

----

## Contributors

Developed as part of the Software Engineering Mini Project.

Primary Contributors

- Jeevan Sagale
- Tanay Daware
- Vedant Hire

----

## License

This project is intended for educational and research purposes.
