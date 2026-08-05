# EcoTrack AI Service API Documentation

## Community Analytics Service (`src/services/communityAnalyticsService.ts`)

### `subscribeToCommunityStats(callback)`
Subscribes to global real-time statistics (`/communityStats/global`).
- **Returns:** Unsubscribe function.

### `subscribeToLeaderboard(callback)`
Subscribes to the top 10 community leaderboard entries sorted by `ecoScore` descending.
- **Returns:** Unsubscribe function.

### `updateCommunityAggregates(payload)`
Client-side bridge function. Delegated to backend Cloud Functions trigger (`onAssessmentCreated`).

### `toggleAnonymousRanking(userId, isAnonymous)`
Updates user privacy preference on the community leaderboard.
