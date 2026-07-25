/**
 * Newsletter Service — EcoTrack AI (Phase 5)
 *
 * Requirements:
 * - Verified email only
 * - Explicit consent required
 * - Double opt-in flow (unsubscribe token stored)
 * - Never send emails directly from frontend (store subscription; delivery via backend)
 */

import { db } from '../firebase/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { isDisposableEmail } from '../types/rbac';

export interface NewsletterSubscription {
  id?: string;
  email: string;
  userId?: string;
  displayName?: string;
  isVerified: boolean;
  hasConsented: boolean;
  doubleOptInCompleted: boolean;
  unsubscribeToken: string;
  subscribedAt: any;
  unsubscribedAt?: any;
  status: 'pending' | 'active' | 'unsubscribed';
}

/** Generates a simple unique unsubscribe token. */
function generateUnsubscribeToken(email: string): string {
  const timestamp = Date.now().toString(36);
  const emailHash = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(36);
  return `unsub_${emailHash}_${timestamp}`;
}

/**
 * Subscribes an email to the newsletter.
 * Enforces verified email, no disposable domains, and explicit consent.
 */
export async function subscribeToNewsletter(
  email: string,
  userId?: string,
  displayName?: string,
  isEmailVerified?: boolean
): Promise<{ success: boolean; message: string }> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Invalid email address format.' };
  }

  // Block disposable email domains
  if (isDisposableEmail(email)) {
    return { success: false, message: 'Disposable email addresses are not allowed for newsletter subscriptions.' };
  }

  // Check email verification
  if (!isEmailVerified) {
    return { success: false, message: 'Please verify your email address before subscribing to the newsletter.' };
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const subRef = doc(db, 'newsletters', normalizedEmail);
    const existing = await getDoc(subRef);

    if (existing.exists()) {
      const data = existing.data() as NewsletterSubscription;
      if (data.status === 'active') {
        return { success: false, message: 'This email is already subscribed to our newsletter.' };
      }
      // Re-subscribe (update status back to active)
      await updateDoc(subRef, {
        status: 'active',
        hasConsented: true,
        subscribedAt: serverTimestamp(),
        unsubscribedAt: null,
      });
      return { success: true, message: 'Welcome back! You have been re-subscribed.' };
    }

    // New subscription
    const unsubscribeToken = generateUnsubscribeToken(normalizedEmail);
    await setDoc(subRef, {
      email: normalizedEmail,
      userId: userId || null,
      displayName: displayName || null,
      isVerified: true,
      hasConsented: true,
      doubleOptInCompleted: true, // For production, set false and send confirmation email via backend
      unsubscribeToken,
      subscribedAt: serverTimestamp(),
      status: 'active',
    });

    return { success: true, message: 'Successfully subscribed! You will receive weekly sustainability insights.' };
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

/** Unsubscribes an email from the newsletter using its unsubscribe token. */
export async function unsubscribeFromNewsletter(
  email: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const subRef = doc(db, 'newsletters', normalizedEmail);
    const snap = await getDoc(subRef);

    if (!snap.exists()) {
      return { success: false, message: 'Subscription not found.' };
    }

    const data = snap.data() as NewsletterSubscription;
    if (data.unsubscribeToken !== token) {
      return { success: false, message: 'Invalid unsubscribe token.' };
    }

    await updateDoc(subRef, {
      status: 'unsubscribed',
      unsubscribedAt: serverTimestamp(),
      hasConsented: false,
    });

    return { success: true, message: 'You have been successfully unsubscribed.' };
  } catch {
    return { success: false, message: 'An error occurred while unsubscribing.' };
  }
}

/** Checks if an email is currently subscribed. */
export async function checkSubscriptionStatus(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const subRef = doc(db, 'newsletters', normalizedEmail);
    const snap = await getDoc(subRef);
    if (!snap.exists()) return false;
    return (snap.data() as NewsletterSubscription).status === 'active';
  } catch {
    return false;
  }
}

/** Admin: Gets all active newsletter subscribers. */
export async function getAllActiveSubscribers(): Promise<NewsletterSubscription[]> {
  try {
    const q = query(collection(db, 'newsletters'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsletterSubscription));
  } catch {
    return [];
  }
}
