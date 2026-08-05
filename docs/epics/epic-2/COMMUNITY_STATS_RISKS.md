# Community Statistics System Risks & Vulnerabilities Analysis

This document details the risks, failure modes, and architectural mismatches in the EcoTrack Community Statistics feature identified during Epic 2.1 investigation.

---

## 1. High-Severity Structural Failure Modes

### Risk 1.1: Schema Mismatch Between V2 Assessment & Cloud Function
- **Severity**: Critical (P0)
- **Root Cause**: In `functions/src/index.ts` (`onAssessmentCreated`), the function destructures flat fields from `event.data.data()`:
  ```ts
  const {
    transportEmission = 0,
    energyEmission = 0,
    foodEmission = 0,
    wasteEmission = 0,
    totalEmission = 0,
    ecoScore = 0,
    ecoLabel = "Calculated",
    annualEstimate = 0,
  } = data;
  ```
  However, `saveV2Assessment` in `src/firebase/firestore.ts` saves nested emissions:
  ```ts
  emissions: {
    totalKgCO2PerYear: number,
    totalTonnesCO2PerYear: number,
    breakdown: { transport, energy, food, waste, shopping }
  }
  ```
- **Impact**: All emissions, total CO₂, and ecoScores evaluate to `0` inside the Cloud Function transaction. Every new assessment adds `0 kg` to `totalCO2Tracked` and `0` to breakdown stats.
- **Evidence**: `data.transportEmission` is `undefined`, triggering default value `= 0`.

---

### Risk 1.2: User Profile Field Mismatch (`name` vs `displayName`)
- **Severity**: High (P1)
- **Root Cause**: In `functions/src/index.ts`, `onAssessmentCreated` attempts to fetch user name via:
  ```ts
  const userSnap = await db.collection("users").doc(userId).get();
  let displayName = "Eco User";
  if (userSnap.exists) {
    displayName = userSnap.data()?.displayName || "Eco User";
  }
  ```
  However, `createUserDocument` in `src/firebase/firestore.ts` stores user names in property `name` (e.g. `{ uid, name, email, role }`), NOT `displayName`.
- **Impact**: `userSnap.data()?.displayName` returns `undefined`. Every user on the public leaderboard and reports feed appears as `"Eco User"` (or `"Eco U."` after privacy formatting), erasing personalized leaderboard rankings.

---

### Risk 1.3: Total Dependency on Deployed Cloud Functions (Client Stubs)
- **Severity**: High (P1)
- **Root Cause**: In `src/services/communityAnalyticsService.ts`, `updateCommunityAggregates()` and `removeCommunityEntry()` were changed into no-op `console.log` promises.
- **Impact**:
  1. If Cloud Functions are not deployed to Google Cloud Platform / Firebase project (e.g., local development without emulator or standard client SPA hosting without Cloud Functions), saving assessments NEVER updates community stats or leaderboards.
  2. There is no client-side fallback or offline queue mechanism. If the Cloud Function execution fails or times out, the snapshot data becomes permanently desynchronized with actual user assessments.

---

### Risk 1.4: Initial Document Non-Existence & Infinite Empty State
- **Severity**: Medium (P2)
- **Root Cause**: When a fresh Firebase database is initialized, document `communityStats/global` does not exist.
- **Impact**: `onSnapshot` returns `snap.exists() === false`. The hook `useCommunityStats` sets `stats = null` and `loading = false`. The UI permanently renders empty state indicators (`—`) across all overview metric cards until the first successful write to `communityStats/global`.

---

### Risk 1.5: V1 Legacy vs V2 Assessment Divergence
- **Severity**: Medium (P2)
- **Root Cause**: Legacy v1 calculations are saved to collection `calculations/{calculationId}`. V2 assessments are saved to `users/{userId}/assessments/{assessmentId}`.
- **Impact**: The Cloud Function `onAssessmentCreated` only listens to `users/{userId}/assessments/{assessmentId}`. Any user saving a v1 legacy calculation (or imported calculation) will not trigger community aggregation, creating a reporting disparity between legacy and v2 assessments.

---

## 2. Risk Matrix Summary

| Risk ID | Failure Mode | Probability | Severity | User-Facing Effect |
|---|---|---|---|---|
| **R-1.1** | V2 Assessment schema mismatch | High | Critical | Aggregated CO₂ & EcoScores evaluate to 0 |
| **R-1.2** | User profile `name` vs `displayName` mismatch | High | High | Leaderboard names fall back to generic "Eco User" |
| **R-1.3** | Pure Cloud Function reliance without fallback | High | High | Community stats remain blank in non-CF environments |
| **R-1.4** | Missing `communityStats/global` init doc | Medium | Medium | Overview cards render `—` for new deployments |
| **R-1.5** | Legacy `calculations` ignored by triggers | Low | Medium | V1 calculations omitted from aggregated community stats |

---

## 3. Non-Issues & Confirmed Safe Areas

- **Firestore Security Rules**: Rules explicitly permit `allow read: if true;` for `communityStats`, `communityLeaderboard`, and `communityReports`. Read permissions are NOT blocking data retrieval.
- **Firestore Query Indexes**: `communityLeaderboard` order-by query (`orderBy('ecoScore', 'desc')`) uses single-field indexing, which Firestore builds automatically. No missing composite index errors.
- **UI Crash Safety**: `Community.tsx` checks for `stats === null` and `leaderboard.length === 0` safely using optional chaining and guard clauses.
