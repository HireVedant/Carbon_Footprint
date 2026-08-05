# Assessment Architecture & Lifecycle Execution Flow

This document provides a comprehensive structural mapping of the EcoTrack Assessment System, detailing data flows, component hierarchies, state boundaries, calculation steps, persistence mechanics, and downstream consumption.

---

## 1. End-to-End Assessment Lifecycle Diagram

```
[ User Navigates to /assessment ]
               │
               ▼
   AssessmentProvider Mounts (src/context/AssessmentContext.tsx)
   Initializes default AssessmentAnswers & step = 'location'
               │
               ▼
   Assessment Page Render (src/pages/Assessment.tsx)
   Displays Mode Toggle (Quick vs Detailed) & Step Wizard
               │
               ▼ [ Step 1: Location ]
   LocationSelector (State, District, City, Dwelling, Urban/Rural)
   ──> updateAnswers({ state, district, city, dwelling, isUrban })
               │
               ▼ [ Step 2: Transport ]
   TransportSection (Multi-Select Vehicles, Daily Km, Occupancy, Transit, Flights)
   ──> updateAnswers({ transportEntries, publicTransitModes, flightDetails })
               │
               ▼ [ Step 3: Energy ]
   Household Energy (Electricity kWh/Bill, LPG/PNG, Solar kW, Appliances)
   ──> updateAnswers({ electricityKWh, monthlyBillRupees, cookingFuel, appliances })
               │
               ▼ [ Step 4: Food ]
   FoodSection (Multi-Select Diet Mix, Food Waste, Dining Out)
   ──> updateAnswers({ dietMix, dietType, foodWasteLevel, diningOutMealsWeekly })
               │
               ▼ [ Step 5 & 6: Waste & Shopping (Detailed Mode Only) ]
   Waste & Shopping Sections (Segregation, Composting, Apparel, Electronics)
   ──> updateAnswers({ wasteSegregation, apparelItemsMonthly, ... })
               │
               ▼ [ Step 7: Review & Submit ]
   ReviewSection -> User Clicks "Calculate Footprint"
               │
               ▼
   runCalculation() (src/utils/calculationEngine.ts)
   Delegates to coreCalculateEmissions() in src/core/calculation/emissions.ts
               │
               ├──────────────────────────────────────────────────┐
               ▼                                                  ▼
   Pure Mathematical Calculation Engine                 Data Persistence & Aggregation
   (CEA Grid, ARAI Transport, ICAO Flight, Diet)       saveV2Assessment(user.uid, answers, result)
               │                                                  │
               ▼                                                  ▼
   CalculationResult Object Generated                  Firestore Write to Collection:
   { totalKg, totalTonnes, breakdown, confidence }     users/{userId}/assessments/{assessmentId}
               │                                                  │
               ▼                                                  ▼
   State Update: setResult(computedResult)              Cloud Function Event Trigger
   Renders Results View in Assessment.tsx              onAssessmentCreated Aggregates Stats
               │                                                  │
               └────────────────────────┬─────────────────────────┘
                                        │
                                        ▼
                   Downstream Consumption Views
                   ├── Dashboard.tsx (Latest Assessment & KPIs)
                   ├── History.tsx (Unified Chronological List)
                   └── Community.tsx (Live Aggregates & Leaderboard)
```

---

## 2. Component Hierarchy & Modular Structure

```
AssessmentProvider (src/context/AssessmentContext.tsx)
└── Assessment (src/pages/Assessment.tsx)
    ├── ModeSelector ('quick' vs 'detailed')
    ├── ProgressBar & StepProgressIndicator
    ├── Form Content Container (AnimatePresence)
    │   ├── LocationSelector (src/components/calculator/LocationSelector.tsx)
    │   ├── TransportSection (Multi-select vehicles & transit)
    │   │   └── FlightPlanner (src/components/calculator/FlightPlanner.tsx)
    │   ├── EnergySection (Electricity, LPG, Solar)
    │   │   └── ApplianceSelector (src/components/calculator/ApplianceSelector.tsx)
    │   ├── FoodSection (Multi-select diet mix)
    │   ├── WasteSection (CPCB segregation & composting)
    │   ├── ShoppingSection (UNEP apparel & electronics)
    │   └── ReviewSection (Summary verification)
    └── ResultsView
        ├── TotalEmissionCard
        ├── CategoryBreakdownGrid
        └── ConfidenceBreakdownCard (src/components/calculator/ConfidenceBadge.tsx)
```

---

## 3. State Ownership & Data Transformation Lifecycle

| Stage | Data Representation | Storage Location | Lifetime |
|---|---|---|---|
| **Raw User Input** | String / Event Values | Component local state & inputs | Transient (per keystroke) |
| **Context State** | `AssessmentAnswers` object | `AssessmentContext` (`React.useState`) | Session memory (Lost on refresh) |
| **Calculation Result** | `CalculationResult` object | `AssessmentContext.result` | Component state until reset |
| **Firestore Payload** | V2 Assessment Schema | `users/{uid}/assessments/{id}` | Permanent Firestore Document |
| **Normalized History** | `NormalizedAssessmentDocument` | React state in `Dashboard` / `History` | Fetched on page mount |

---

## 4. Scientific Calculation Engine Pipeline (`src/core/calculation/`)

```
                        calculateEmissions(answers)
                                    │
    ┌──────────────────┬────────────┼────────────┬──────────────────┐
    ▼                  ▼            ▼            ▼                  ▼
transport.ts       energy.ts     food.ts     waste.ts          shopping.ts
 (ARAI/ICAO)       (CEA Grid)    (SEI/IPCC)   (CPCB MSW)       (UNEP Factor)
    │                  │            │            │                  │
    └──────────────────┴────────────┼────────────┴──────────────────┘
                                    │
                                    ▼
                          emissions.ts (Aggregator)
       Combines Sector Breakdown & Calls confidence.ts & ecoScore.ts
                                    │
                                    ▼
                         CalculationResult Output
```

### Sector Engines Breakdown:
1. **Transport Engine (`transport.ts`)**: Calculates personal vehicle emissions via ARAI emission factors, public transit emissions (metro, bus, auto), and aviation emissions via ICAO geodesic distance.
2. **Energy Engine (`energy.ts`)**: Resolves state-specific CEA grid factor (e.g. 0.716 kg CO₂/kWh for Maharashtra), calculates LPG/PNG cooking fuel consumption, and offsets solar generation.
3. **Food Engine (`food.ts`)**: Aggregates multi-diet mix weights (Vegan, Vegetarian, Non-Veg, Pescatarian) and applies food waste multipliers.
4. **Waste Engine (`waste.ts`)**: Applies CPCB municipal solid waste per capita baselines with segregation and composting reduction factors.
5. **Shopping Engine (`shopping.ts`)**: Estimates lifecycle emissions for clothing, electronics, and e-commerce delivery parcels based on UNEP factors.

---

## 5. Downstream Consumption & Persistence Mechanics

- **Persistence**: Upon user submission in `Assessment.tsx`, `saveV2Assessment()` creates an immutable document under `users/{userId}/assessments/{assessmentId}`.
- **Dashboard Consumption**: `Dashboard.tsx` checks `useAssessment().result` first. If `null` (e.g. after refresh), it fetches `getUserAssessments(user.uid)` from Firestore, rendering the latest assessment KPIs and charts.
- **History Consumption**: `History.tsx` calls `getUnifiedUserHistory(user.uid)`, combining V1 legacy calculations and V2 assessments into a unified chronological progress feed.
- **AI Insights Pipeline**: Gemini AI advice is requested on demand and cached back to the Firestore document via `cacheAiAdvice(userId, assessmentId, aiAdvice)` in `src/firebase/firestore.ts`.
