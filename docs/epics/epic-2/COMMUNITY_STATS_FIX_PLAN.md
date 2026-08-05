# Community Statistics Stabilization Fix Plan (Epic 2.2 Preparation)

This document provides the technical specification and implementation plan for fixing Community Statistics in Epic 2.2.

---

## 1. Executive Summary & Root Cause

The investigation in Epic 2.1 identified three core root causes preventing Community Statistics from functioning correctly:

1. **Cloud Function Schema Mismatch**: `functions/src/index.ts` expects top-level flat fields (`transportEmission`, `totalEmission`, `ecoScore`) which exist only in legacy V1 calculations. V2 assessments store these nested inside `emissions` (`emissions.totalKgCO2PerYear`, `emissions.breakdown.transport`, etc.) and compute `ecoScore` dynamically.
2. **User Profile Name Field Mismatch**: Cloud Function looks up `userSnap.data()?.displayName`, whereas `src/firebase/firestore.ts` stores `name`.
3. **Missing Fallback for Client-Only Deployments**: When Cloud Functions are not deployed or fail, there is no client-side aggregation safety fallback or initialization of default `communityStats/global`.

---

## 2. Files Involved

| File | Purpose of Change |
|---|---|
| `functions/src/index.ts` | Update `onAssessmentCreated` and `onAssessmentDeleted` to read V2 assessment schema fields (`data.emissions`, `data.answers`, `data.location`) and user `name`. |
| `src/services/communityAnalyticsService.ts` | Add client-side safe document initialization fallback when `communityStats/global` does not exist, and support hybrid fallback when Cloud Functions are disabled/offline. |
| `src/hooks/useCommunityStats.ts` | Ensure default fallback stats are provided gracefully when `communityStats/global` is null or empty. |

---

## 3. Recommended Smallest Fixes (Step-by-Step)

### Step 1: Update Cloud Function Assessment Extraction (`functions/src/index.ts`)
Modify `onAssessmentCreated` to handle both V2 assessment nested schema and legacy flat schema:

```ts
// Extract emissions with fallback supporting V2 and V1 schemas
const totalKg = data.emissions?.totalKgCO2PerYear ?? (data.totalEmission || data.annualEstimate * 1000 || 0);
const totalTonnes = data.emissions?.totalTonnesCO2PerYear ?? (data.annualEstimate || (totalKg / 1000) || 0);

const transportEmission = data.emissions?.breakdown?.transport ?? (data.transportEmission || 0);
const energyEmission    = data.emissions?.breakdown?.energy    ?? (data.energyEmission || 0);
const foodEmission      = data.emissions?.breakdown?.food      ?? (data.foodEmission || 0);
const wasteEmission     = data.emissions?.breakdown?.waste     ?? (data.wasteEmission || 0);

// Compute EcoScore if not directly provided (V2 scale: 100 - (totalKg / 100))
const ecoScore = typeof data.ecoScore === 'number' 
  ? data.ecoScore 
  : Math.max(0, Math.min(100, Math.round(100 - (totalKg / 100))));

const ecoLabel = data.ecoLabel || (ecoScore >= 80 ? 'Eco Leader' : ecoScore >= 50 ? 'Moderate' : 'High Impact');

// Fix User Display Name lookup (check 'name' field first, then 'displayName')
const userSnap = await db.collection("users").doc(userId).get();
let displayName = "Eco User";
if (userSnap.exists) {
  const userData = userSnap.data();
  displayName = userData?.name || userData?.displayName || "Eco User";
}
```

---

### Step 2: Implement Deletion Trigger Schema Support (`functions/src/index.ts`)
Update `onAssessmentDeleted` with identical V2/V1 schema extraction to ensure stats decrement accurately when assessments are soft-deleted or removed.

---

### Step 3: Add Graceful Client-Side Default Statistics Fallback (`src/services/communityAnalyticsService.ts`)
Update `subscribeToCommunityStats` so that if `communityStats/global` document does not exist, it emits a sensible zeroed stats object rather than `null`:

```ts
export function subscribeToCommunityStats(
  callback: (stats: CommunityStats | null) => void
): () => void {
  return onSnapshot(COMMUNITY_STATS_DOC, (snap) => {
    if (!snap.exists()) {
      // Default zeroed statistics structure if global document has not been initialized
      callback({
        totalUsers: 0,
        totalReports: 0,
        totalCO2Tracked: 0,
        averageAnnualCO2: 0,
        averageEcoScore: 0,
        emissionBreakdown: { transport: 0, energy: 0, food: 0, waste: 0 },
        updatedAt: null,
      });
      return;
    }
    const d = snap.data();
    callback({
      totalUsers: d.totalUsers ?? 0,
      totalReports: d.totalReports ?? 0,
      totalCO2Tracked: d.totalCO2Tracked ?? 0,
      averageAnnualCO2: d.averageAnnualCO2 ?? 0,
      averageEcoScore: d.averageEcoScore ?? 0,
      emissionBreakdown: d.emissionBreakdown ?? { transport: 0, energy: 0, food: 0, waste: 0 },
      updatedAt: toDate(d.updatedAt),
    });
  });
}
```

---

## 4. Regression Risks & Mitigation

| Potential Risk | Mitigation Strategy |
|---|---|
| **V1 legacy calculations fail to aggregate** | Dual schema extraction (`data.emissions?.totalKgCO2PerYear ?? data.totalEmission`) ensures both V1 and V2 documents trigger correct aggregation. |
| **Existing leaderboard entries show wrong name** | Lookup checks `userData?.name || userData?.displayName`. Backward compatible with existing users. |
| **Transaction conflicts under high write volume** | Cloud Function uses `db.runTransaction` with exponential backoff built into Firebase Admin SDK. |
| **Client build failure** | Zero changes to exported function signatures in `communityAnalyticsService.ts`. `npm run build` verified. |

---

## 5. Verification & Testing Strategy

### Automated Verification
1. Run `npm run build` in root workspace and `npm run build` inside `functions/` directory.
2. Run unit tests: `npm run test` (if applicable) or verify `communityAnalyticsService.test.ts`.

### Manual & E2E Verification Flow
1. **Assessment Creation Test**: Submit a new V2 assessment in `Assessment.tsx`.
2. **Firestore Doc Inspection**: Check Firestore `users/{uid}/assessments/{id}` and confirm Cloud Function trigger fires.
3. **Community Stats Verification**: Open `/community` route and verify:
   - Total Reports incremented by 1.
   - Total CO₂ Tracked updated with exact assessment emissions.
   - EcoScore average recalculated.
   - Leaderboard entry appears with user's actual name (`name` field from profile).
   - Live Community Breakdown Doughnut Chart renders updated category proportions.
