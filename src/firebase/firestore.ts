import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { CalculationResult } from "../utils/carbonCalculator";

/* -------------------------------------------------------------------------- */
/*                               User Interfaces                              */
/* -------------------------------------------------------------------------- */

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photo: string;
  userType: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
}

export interface SavedCalculation {
  id: string;
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

  createdAt?: Timestamp;
}

/* -------------------------------------------------------------------------- */
/*                             User Profile Services                          */
/* -------------------------------------------------------------------------- */

/**
 * Creates a new user profile if it doesn't exist.
 * Otherwise updates the user's last login timestamp.
 */
export async function createUserDocument(
  uid: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid,
      name: profile.name ?? "Eco User",
      email: profile.email ?? "",
      photo:
        profile.photo ??
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      userType: profile.userType ?? "Individual",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
  }
}

/**
 * Fetch a user's profile.
 */
export async function getUserDocument(
  uid: string
): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

/**
 * Update user profile fields.
 */
export async function updateUserDocument(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
}

/* -------------------------------------------------------------------------- */
/*                         Carbon Calculation Services                         */
/* -------------------------------------------------------------------------- */

/**
 * Save a carbon footprint calculation.
 *
 * Returns the Firestore document ID.
 */
export async function saveCalculation(
  userId: string,
  results: CalculationResult
): Promise<string> {
  const calculationsRef = collection(db, "calculations");

  const docRef = await addDoc(calculationsRef, {
    userId,

    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
 * Fetch all calculations belonging to a user.
 *
 * Ordered by newest first.
 */
export async function getUserCalculations(
  userId: string
): Promise<SavedCalculation[]> {
  try {
    const calculationsRef = collection(db, "calculations");

    const q = query(
      calculationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const calculations: SavedCalculation[] = [];

    snapshot.forEach((document) => {
      calculations.push({
        id: document.id,
        ...(document.data() as Omit<SavedCalculation, "id">),
      });
    });

    return calculations;
  } catch (error) {
    console.error("Failed to fetch calculations:", error);
    return [];
  }
}

/**
 * Delete a calculation permanently.
 */
export async function deleteCalculation(
  calculationId: string
): Promise<void> {
  const calculationRef = doc(db, "calculations", calculationId);
  await deleteDoc(calculationRef);
}