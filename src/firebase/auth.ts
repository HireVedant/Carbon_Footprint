import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { createUserDocument } from './firestore';

// ---------------- Google Auth Provider ----------------
const googleProvider = new GoogleAuthProvider();

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
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  });

  // Sync to Firestore user profile collection
  await createUserDocument(user.uid, {
    name,
    email,
    photo: user.photoURL || '',
  });

  // Optional: Send verification email
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Error sending verification email on signup:", error);
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
 * Logs in a user using Google OAuth popups.
 */
export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // Sync user profile to Firestore
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
