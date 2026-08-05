# EcoTrack Backend & Database Architecture

## Firebase Firestore Architecture

### Collections

1. **`users`**
   - **Path:** `/users/{uid}`
   - **Fields:** `displayName`, `email`, `role`, `createdAt`
   - **Security:** Self-read/write. Admins can manage all.

2. **`assessments` (Subcollection of `users`)**
   - **Path:** `/users/{uid}/assessments/{assessmentId}`
   - **Fields:** `emissions`, `timestamp`, `status`, `totalScore`
   - **Security:** Immutable once created (except soft deletes).

3. **`communityStats`**
   - **Path:** `/communityStats/global`
   - **Fields:** `totalUsers`, `totalReports`, `totalCO2Tracked`, `averageAnnualCO2`, `averageEcoScore`, `emissionBreakdown`
   - **Security:** Public Read. **Cloud Functions Write Only.**

4. **`communityLeaderboard`**
   - **Path:** `/communityLeaderboard/{uid}`
   - **Fields:** `ecoScore`, `displayName` (or Anonymous), `highestCategory`
   - **Security:** Public Read. Cloud Functions Write Only.

5. **`communityReports`**
   - **Path:** `/communityReports/{assessmentId}`
   - **Security:** Public Read. Cloud Functions Write Only.

## Cloud Functions
The core logic for aggregates lives in `functions/src/index.ts`.
- **`onAssessmentCreated`**: Triggers when a new assessment is added to a user's subcollection. It performs a secure Transaction to update the `global` community stats document and update the leaderboard.
- **`onAssessmentDeleted`**: Triggers on deletion to decrement the global stats.

## Authentication
- Firebase Auth handles identity.
- Users authenticate via Email/Password or Google.
- Roles (`user`, `admin`, `owner`) are stored in the user document and ideally synchronized to Custom Claims.
