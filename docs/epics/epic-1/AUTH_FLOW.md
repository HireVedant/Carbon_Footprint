# Authentication Flow

## Login Execution Lifecycle
1. **User Interaction:** User clicks "Sign In" in `src/pages/Login.tsx`.
2. **Form Validation:** Client-side check for empty fields (`email`, `password`).
3. **Context Invocation:** `login()` function in `AuthContext.tsx` is called.
4. **Loading State (Context):** `AuthContext` sets global `loading = true`.
5. **Firebase Service Invocation:** `authLogin()` from `src/firebase/auth.ts` is called.
6. **Firebase Auth Trigger:** `signInWithEmailAndPassword` executes.
7. **Asynchronous Listener Fire:** Firebase fires the `onAuthStateChanged` listener in `AuthContext.tsx` (runs in parallel).
8. **Firestore Update:** `authLogin()` attempts to update the user's last login timestamp via `createUserDocument`. *(Potential Failure Point)*
9. **Return to Context:** `authLogin()` returns the User object.
10. **Context Finally:** `AuthContext` sets global `loading = false`.
11. **Component Resolution:** `Login.tsx` try block resolves.
12. **Toast Notification:** Success toast appears.
13. **Timeout Navigation:** Hardcoded `setTimeout` navigates to `/dashboard` after 1000ms.
14. **Protected Route:** `ProtectedRoute.tsx` mounts, checks `user` and `roleLoading`, then renders Dashboard.

## Signup Execution Lifecycle
1. **User Interaction:** User clicks "Create Account" in `src/pages/Register.tsx`.
2. **Form Validation:** Checks for name, email, and password length.
3. **Context Invocation:** `signUp()` in `AuthContext.tsx` is called.
4. **Firebase Service Invocation:** `signUpWithEmail()` from `src/firebase/auth.ts` is called.
5. **Firebase Auth Trigger:** `createUserWithEmailAndPassword` executes.
6. **Profile Update:** `updateProfile` updates the display name in Firebase Auth.
7. **Firestore Creation:** `createUserDocument` creates the initial profile in Firestore. *(Potential Failure Point)*
8. **Email Verification:** Attempts `sendEmailVerification` (silently catches errors).
9. **Component Resolution:** `Register.tsx` try block resolves.
10. **Timeout Navigation:** Hardcoded `setTimeout` navigates to `/dashboard` after 1200ms.

## Session Restore Lifecycle
1. **App Mounts:** `AuthContext.tsx` initializes with `user = null`, `userProfile = null`, `loading = true`.
2. **Listener Setup:** `useEffect` attaches `onAuthStateChanged`.
3. **Firebase Check:** Firebase SDK checks IndexedDB/LocalStorage for a persisted session token.
4. **Listener Fires (If Authenticated):**
   - Sets `user` state.
   - Triggers `bootstrapOwnerAccount` (async, fire-and-forget).
   - Awaits `getUserDocument(uid)` to fetch profile.
   - If profile exists, sets `userProfile`.
   - If fetch fails or errors, sets a fallback `userProfile` (Mocked).
5. **Loading Complete:** `setLoading(false)` is called.
6. **Protected Route Re-evaluation:** `ProtectedRoute.tsx` stops rendering the full-screen spinner and allows access to protected components.
