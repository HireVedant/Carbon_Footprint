import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { createUserDocument } from './firestore';

// ---------------- Authentication Services ----------------

/**
 * Registers a new user with email and password and creates their user profile in Firestore.
 */
export async function signUpWithEmail(email: string, password: string, name: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Auth Display Name
  await updateProfile(user, {
    displayName: name,
  });

  // Sync to Firestore user profile collection
  await createUserDocument(user.uid, {
    name,
    email,
    photo: '',
  });

  // Optional: Send verification email
  try {
    await sendEmailVerification(user);
  } catch (error) {
    // Ignore verification email errors
  }

  return user;
}

/**
 * Logs in a user using email and password.
 */
export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update last login timestamp in Firestore
  await createUserDocument(user.uid, {
    name: user.displayName || 'Eco User',
    email: user.email || '',
    photo: user.photoURL || '',
  });

  return user;
}

/**
 * Resets a user password using email reset links.
 */
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sends a manual email verification link.
 */
export async function sendEmailVerificationLink() {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error('No authenticated user found to verify.');
  }
}

/**
 * Logs out the current user session.
 */
export async function logoutUser() {
  await signOut(auth);
}
