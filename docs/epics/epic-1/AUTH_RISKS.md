# Authentication Risks & Error Handling

## 1. Error Handling Inventory (try/catch locations)

### `src/context/AuthContext.tsx`
- **`onAuthStateChanged` Firestore Fetch:** Catches errors from `getUserDocument(currentUser.uid)`. **Risk:** Swallows the error silently and mocks a `userProfile`. If Firestore rules are blocking reads, the developer won't see it, but the user gets a degraded experience.
- **`signUp`, `login`, `logout`:** Simple try/finally to toggle `loading` state. **Risk:** `loading` state is manipulated here *and* in `onAuthStateChanged`, creating race conditions where loading might flash false prematurely.

### `src/pages/Login.tsx` & `Register.tsx`
- **`handleSubmit`:** Catches errors from `login()` / `signUp()`. Uses `getLoginErrorMessage(code)`. **Risk:** If the error originates from Firestore (e.g., updating the timestamp) rather than Firebase Auth, `code` is undefined or unrecognized, returning the generic "Sign in failed" toast, even though the authentication actually succeeded.

### `src/firebase/auth.ts`
- **`signUpWithEmail`:** Wraps `sendEmailVerification` in a try/catch and explicitly swallows the error. **Risk:** Users might not receive verification emails without any UI feedback indicating failure.
- **`loginWithEmail`:** Lacks try/catch around `createUserDocument`. **Risk:** This is the primary cause of the false-failure bug.

## 2. Loading State Audit

### Documented States
- **Login Loading:** `isLoading` in `Login.tsx`. Disables the submit button and shows an inline spinner.
- **Signup Loading:** `isLoading` in `Register.tsx`. Disables the submit button.
- **Auth Restore Loading:** `loading` in `AuthContext.tsx`. Handled by `ProtectedRoute` which displays a full-screen "Verifying Authentication & Access..." spinner.
- **Profile Loading:** Bound to the main `loading` state in `AuthContext.tsx`.

### Identified Missing States
- **Navigation Feedback:** The hardcoded `setTimeout(() => navigate('/dashboard'), 1000)` creates a 1-second gap where the UI is technically active but the user is waiting to transition.
- **Fallback Profile Loading:** If `onAuthStateChanged` falls back to the mocked profile, subsequent parts of the app might try to fetch real data and fail without dedicated skeleton loaders.
