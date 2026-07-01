import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { CalculationResult } from '../utils/carbonCalculator';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photo: string;
  userType: string;
  createdAt: any;
  lastLogin?: any;
}

export interface SavedCalculation {
  calculationId?: string;
  userId: string;
  date: string;
  transportEmission: number;
  energyEmission: number;
  foodEmission: number;
  wasteEmission: number;
  totalEmission: number;
  ecoScore: number;
  ecoLabel: string;
  annualEstimate: number;
  createdAt: any;
}

// ---------------- User Profiles Services ----------------

/**
 * Creates or updates the user profile document in Firestore.
 */
export async function createUserDocument(uid: string, profile: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // New user document
    await setDoc(userRef, {
      uid,
      name: profile.name || 'Eco User',
      email: profile.email || '',
      photo: profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      userType: profile.userType || 'Individual',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    // Existing user login timestamp update
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
  }
}

/**
 * Gets a user profile document from Firestore.
 */
export async function getUserDocument(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

/**
 * Updates a user profile document in Firestore.
 */
export async function updateUserDocument(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
}

// ---------------- Calculations Services ----------------

/**
 * Saves a new carbon footprint calculation to Firestore.
 */
export async function saveCalculation(userId: string, results: CalculationResult): Promise<string> {
  const calculationsRef = collection(db, 'calculations');
  const docRef = await addDoc(calculationsRef, {
    userId,
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    transportEmission: results.transportEmissions,
    energyEmission: results.energyEmissions,
    foodEmission: results.foodEmissions,
    wasteEmission: results.wasteEmissions,
    totalEmission: results.totalEmissions,
    ecoScore: results.ecoScore,
    ecoLabel: results.ecoLabel,
    annualEstimate: results.annualEstimate,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Retrieves calculation history for a given user sorted by newest first.
 */
export async function getUserCalculations(userId: string): Promise<SavedCalculation[]> {
  try {
    const calculationsRef = collection(db, 'calculations');
    const q = query(
      calculationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const calculations: SavedCalculation[] = [];
    querySnapshot.forEach((doc) => {
      calculations.push({
        calculationId: doc.id,
        ...doc.data(),
      } as SavedCalculation);
    });
    return calculations;
  } catch (error) {
    console.error('Error fetching calculations:', error);
    // Fallback if index is building or query fails (e.g. mock data or empty list)
    return [];
  }
}

/**
 * Placeholder for deleting a calculation (doesn't permanently delete yet, just prints alert/logs).
 */
export async function deleteCalculationPlaceholder(calculationId: string): Promise<void> {
  console.log(`Placeholder: Requested deletion for calculationId: ${calculationId}. Permanent deletion is disabled for safety.`);
}
