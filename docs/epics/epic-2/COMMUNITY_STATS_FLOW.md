# Community Statistics Pipeline Architecture & Execution Flow

This document details the complete end-to-end data pipeline for EcoTrack Community Statistics, from assessment completion to real-time rendering on the Community page (`Community.tsx`).

---

## 1. End-to-End Pipeline Diagram

```
[ User Completes Assessment ]
             │
             ▼ (Assessment.tsx)
   saveV2Assessment()
             │
             ▼ (src/firebase/firestore.ts)
Firestore Write: users/{userId}/assessments/{assessmentId}
             │
             ▼ [ Firestore Trigger Event ]
   onAssessmentCreated (v2 Firestore Cloud Function)
             │
             ▼ (functions/src/index.ts)
   Transaction Execution & Aggregation
             │
   ┌─────────┴──────────────────────────────┐
   ▼                                        ▼
communityStats/global             communityLeaderboard/{userId}
(Aggregated totals & averages)    (Highest ecoScore per user)
   │                                        │
   └─────────────────┬──────────────────────┘
                     │
                     ▼ [ Real-time Firestore Listeners ]
   subscribeToCommunityStats() & subscribeToLeaderboard()
                     │
                     ▼ (src/services/communityAnalyticsService.ts)
   useCommunityStats() React Hook
                     │
                     ▼ (src/hooks/useCommunityStats.ts)
   Community Page UI Component
                     │
                     ▼ (src/pages/Community.tsx)
[ Render Analytics, Leaderboard & Live Insights ]
```

---

## 2. Detailed Execution Flow Step-by-Step

### Step 1: Assessment Completion & Save
1. User completes an assessment flow in `src/pages/Assessment.tsx`.
2. `Assessment.tsx` calculates emissions via `calculateV2Footprint()` and calls `saveV2Assessment(userId, answers, result, mode)` from `src/firebase/firestore.ts`.
3. `saveV2Assessment` writes a document to `users/{userId}/assessments/{assessmentId}` with the V2 assessment schema.

### Step 2: Firestore Event Generation
1. Firestore records the document creation under path `users/{userId}/assessments/{assessmentId}`.
2. Firestore emits a 2nd Gen `onDocumentCreated` trigger event for path `"users/{userId}/assessments/{assessmentId}"`.

### Step 3: Cloud Function Trigger & Aggregation
1. Cloud Function `onAssessmentCreated` in `functions/src/index.ts` is invoked by Firebase.
2. The function extracts `userId` and `assessmentId` from event parameters and reads `event.data.data()`.
3. The function fetches the user profile from `users/{userId}` to obtain `displayName`.
4. The function executes a Firestore transaction (`db.runTransaction`) to read and update `communityStats/global` and `communityLeaderboard/{userId}` atomically.

### Step 4: Real-time Subscriptions & Hooks
1. `Community.tsx` mounts and invokes `useCommunityStats()` hook from `src/hooks/useCommunityStats.ts`.
2. `useCommunityStats` attaches two real-time snapshot listeners via `src/services/communityAnalyticsService.ts`:
   - `subscribeToCommunityStats` -> listens to document `communityStats/global`.
   - `subscribeToLeaderboard` -> listens to collection `communityLeaderboard` ordered by `ecoScore desc` limited to 10.
3. On snapshot delivery, state setters `setStats()` and `setLeaderboard()` update state, setting `loadingStats` and `loadingLeaderboard` to `false`.
4. `useMemo` derives dynamic `CommunityInsight[]` combining static SEI insights and live stats metrics.

### Step 5: UI Rendering
1. `Community.tsx` renders:
   - Live overview cards (Total Users, Total Reports, CO₂ Tracked, Avg Annual CO₂, Avg Eco Score).
   - Live Community Breakdown Doughnut Chart (Transport, Energy, Food, Waste).
   - User Leaderboard entries with rank badges and EcoScore indicators.
   - Derived live insights alongside historical SEI survey findings.

---

## 3. Schemas & Data Contracts across the Pipeline

### 3.1 Client V2 Assessment Schema (`users/{userId}/assessments/{assessmentId}`)
```ts
{
  userId: string,
  mode: 'quick' | 'detailed',
  location: { country: string, state: string, district: string, city: string, dwelling: string, isUrban: boolean },
  emissions: {
    totalKgCO2PerYear: number,
    totalTonnesCO2PerYear: number,
    breakdown: { transport: number, energy: number, food: number, waste: number, shopping?: number },
    percentages: { transport: number, energy: number, food: number, waste: number, shopping?: number }
  },
  subBreakdown: { ... },
  confidence: { overallRating: string, overallScore: number },
  answers: AssessmentAnswers,
  aiAdvice: any[],
  status: 'approved',
  calculatorVersion: string,
  datasetVersion: string,
  createdAt: FieldValue (serverTimestamp),
  timestamp: string (ISO)
}
```

### 3.2 Global Community Stats Document (`communityStats/global`)
```ts
{
  totalUsers: number,
  totalReports: number,
  totalCO2Tracked: number, // in kg CO2
  averageAnnualCO2: number, // in tons CO2/year
  averageEcoScore: number, // 0-100 scale
  emissionBreakdown: {
    transport: number, // kg CO2
    energy: number,    // kg CO2
    food: number,      // kg CO2
    waste: number      // kg CO2
  },
  updatedAt: FieldValue (serverTimestamp)
}
```

### 3.3 Leaderboard Entry Document (`communityLeaderboard/{userId}`)
```ts
{
  displayName: string,
  ecoScore: number,
  annualEstimate: number, // in tons CO2/year
  ecoLabel: string,
  highestCategory: 'Transport' | 'Energy' | 'Food' | 'Waste',
  isAnonymous: boolean,
  updatedAt: FieldValue (serverTimestamp)
}
```

---

## 4. Pipeline Health Checklist

| Pipeline Stage | Expected Behavior | Actual Behavior | Status |
|---|---|---|---|
| **1. Assessment Save** | Writes V2 schema to `users/{uid}/assessments/{id}` | Writes V2 schema as expected | ✅ Working |
| **2. Event Trigger** | Cloud Function `onAssessmentCreated` fires | Fires if Cloud Functions are deployed | ⚠️ Environment Dependent |
| **3. Aggregation Reading** | Cloud Function reads emission & score values from snapshot | Reads top-level flat fields that do not exist in V2 schema | ❌ BROKEN (Schema Mismatch) |
| **4. User Name Lookup** | Cloud Function reads `displayName` from `users/{uid}` | `users/{uid}` uses `name` field, causing lookup to return `undefined` | ❌ BROKEN (Field Mismatch) |
| **5. Firestore Rules** | `allow read: if true;` for community collections | Permits unauthenticated & authenticated reads | ✅ Working |
| **6. Realtime Hook** | `useCommunityStats` attaches listeners to Firestore | Listeners attach correctly | ✅ Working |
| **7. UI Graceful Degradation** | `Community.tsx` handles `null` stats and empty leaderboard | Renders `—` and empty state messages without crashing | ✅ Working |
