# Firestore Inventory

## Collections

### 1. `users`
- **Path:** `/users/{userId}`
- **Documents:** User profiles.
- **Subcollections:**
  - `assessments`: Stores individual carbon footprint calculations.

### 2. `communityStats`
- **Path:** `/communityStats/global`
- **Documents:** Single document holding aggregated statistics (total users, total CO2e, averages).
- **Security:** Locked down. Client cannot write to this document.

### 3. `leaderboard`
- **Path:** `/leaderboard/{userId}`
- **Documents:** Public-facing summary metrics for gamification.

## Cloud Functions
- **File:** `functions/src/index.ts`
- **Flow:** Triggers `onDocumentCreated`, `onDocumentUpdated`, and `onDocumentDeleted` for `/users/{userId}/assessments/{assessmentId}`.
- **Action:** Recalculates and securely updates `/communityStats/global`.

## Realtime Listeners
- `useCommunityStats` hook establishes an `onSnapshot` listener to `/communityStats/global`.
- **Potential Bottlenecks:** Missing documents or permission denied errors can cause silent failures and infinite loading spinners on the Community page.

## Security Rules (`firestore.rules`)
- Validates that users can only read/write their own subcollections.
- Denies write access to `communityStats` from the client.

*Note: Firestore schema and rules must remain unchanged.*
