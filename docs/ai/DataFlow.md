# EcoTrack Data Flow Specification

## Comprehensive End-to-End Data Pipeline

```
[ User Interaction ]
        │
        ▼
[ React Component / Page ]
        │
        ▼
[ CalculatorContext / AuthContext ]
        │
        ▼
[ Service Layer (communityAnalyticsService / assessmentService) ]
        │
        ▼
[ Firebase Firestore (client write to /users/{uid}/assessments/{id}) ]
        │
        ▼
[ Firebase Cloud Functions Trigger (onAssessmentCreated) ]
        │
        ▼
[ Secure Transaction: Aggregate stats into /communityStats/global & /communityLeaderboard ]
        │
        ▼
[ Firestore Real-Time Snapshot Listener (onSnapshot) ]
        │
        ▼
[ UI Update in Community & Landing Dashboards ]
```

## Detailed Step Explanation

1. **User Action:** The user completes an assessment form or adjusts a slider.
2. **Local Calculation:** Client-side GHG Protocol calculation functions execute immediately to provide instant UI feedback without waiting for server response.
3. **Firestore Sync:** The calculation object is saved to the user's private subcollection `/users/{userId}/assessments/{assessmentId}` via `setDoc`.
4. **Backend Trigger:** The Cloud Function `onAssessmentCreated` triggers automatically in a isolated server environment.
5. **Secure Aggregation:** The Cloud Function reads the global stats, runs a database transaction, updates total CO₂ tracked, averages scores, and updates the leaderboard.
6. **Real-time Listener:** Subscribed client views receive the new `communityStats` document payload automatically via `onSnapshot` sockets.
