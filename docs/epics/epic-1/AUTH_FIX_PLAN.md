# Authentication Fix Plan

## Root Cause
The "Login Failed" false-failure bug is caused by a race condition between Firebase Authentication and Firestore. 

When a user logs in, `signInWithEmailAndPassword` succeeds, and Firebase immediately establishes the session. However, the subsequent step in `src/firebase/auth.ts` (`loginWithEmail`) attempts to update the user's last login timestamp in Firestore using `createUserDocument`. If this Firestore write fails (due to strict security rules, network drop, or missing indexes), the function throws an error.

The `Login.tsx` component catches this error and triggers the "Login Failed" toast. Meanwhile, the background `onAuthStateChanged` listener has already detected the successful authentication and logged the user into the global app state. The UI reports failure, but the app state is authenticated.

## Files to Modify
1. `src/firebase/auth.ts`
2. `src/pages/Login.tsx`
3. `src/pages/Register.tsx`

## Files NOT to Modify
- `src/components/auth/ProtectedRoute.tsx` (Routing logic is sound)
- `firestore.rules` (Security should remain strict; the app must handle the rejection gracefully)

## Regression Risks
- Silencing the Firestore update error in `auth.ts` might mask genuine database connectivity issues. We must log it to the console.
- Modifying the navigation flow in `Login.tsx` could break the transition to the Dashboard if not synced perfectly with `AuthContext`.

## Testing Strategy
1. **Simulate Firestore Failure:** Temporarily alter `firestore.rules` to deny writes to the user collection, then attempt a login. It should succeed and route to the dashboard, logging a non-fatal warning to the console.
2. **Normal Flow:** Verify standard login and signup flows proceed to the dashboard without hesitation.

## Smallest Possible Fix
1. **In `src/firebase/auth.ts`:** Wrap the `createUserDocument` call inside `loginWithEmail` and `signUpWithEmail` in a `try/catch` block. Catch the error, log `console.warn('Non-fatal: Failed to sync user document')`, and return the `user` object normally. Authentication should not be blocked by a secondary analytics/timestamp write.
2. **In `Login.tsx` & `Register.tsx`:** Remove the hardcoded `setTimeout` for navigation. Rely purely on the promise resolution to trigger `navigate('/dashboard')` immediately, as `AuthContext` will handle the loading shield via `ProtectedRoute`.
