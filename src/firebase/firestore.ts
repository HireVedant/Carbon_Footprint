import { db } from './firebase';
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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { CalculationResult as LegacyCalculationResult } from '../utils/carbonCalculator';
import { CalculationResult as V2CalculationResult } from '../utils/calculationEngine';
import { AssessmentAnswers } from '../utils/calculationEngine';
import { calculateEcoScore } from '../core/calculation/ecoScore';
import { removeCommunityEntry } from '../services/communityAnalyticsService';
import { normalizeAssessmentDocument, NormalizedAssessmentDocument } from '../utils/firestoreMigration';

// ─── Legacy types (preserved for backward compatibility) ─────────────────────

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

// ─── User Profile Services ───────────────────────────────────────────────────

/** Creates or merges a user profile document (never overwrites existing data). */
export async function createUserDocument(uid: string, profile: Partial<UserProfile>): Promise<void> {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid,
      name: profile.name || 'Eco User',
      email: profile.email || '',
      photo: profile.photo || '',
      userType: profile.userType || 'Individual',
      role: 'user',
      isTestAccount: false,
      isSuspended: false,
      isEmailVerified: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    // Only update lastLogin — never overwrite role or other controlled fields
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
  }
}

/** Gets a user profile document. */
export async function getUserDocument(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
}

/** Updates a user profile document (partial update only). */
export async function updateUserDocument(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
}

/** Secure owner bootstrap routine: promotes jeevansagale9@gmail.com to 'owner' if no owner exists yet. */
export async function bootstrapOwnerAccount(currentUid: string, email: string): Promise<void> {
  if (!currentUid || !email || email.toLowerCase() !== 'jeevansagale9@gmail.com') return;

  try {
    const usersCol = collection(db, 'users');
    const ownerQuery = query(usersCol, where('role', '==', 'owner'), limit(1));
    const ownerSnap = await getDocs(ownerQuery);

    if (ownerSnap.empty) {
      const userRef = doc(db, 'users', currentUid);
      await updateDoc(userRef, { role: 'owner', ownerBootstrappedAt: serverTimestamp() });
    }
  } catch (err) {
    console.error('Owner bootstrap check failed:', err);
  }
}

// ─── Legacy Calculation Services (v1 — preserved for existing data) ──────────

/** Saves a legacy v1 carbon footprint calculation. */
export async function saveCalculation(userId: string, results: LegacyCalculationResult): Promise<string> {
  if (!userId) throw new Error('User ID is required to save calculation.');
  const calculationsRef = collection(db, 'calculations');
  const docRef = await addDoc(calculationsRef, {
    userId,
    date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    transportEmission: results.transportEmissions,
    energyEmission: results.energyEmissions,
    foodEmission: results.foodEmissions,
    wasteEmission: results.wasteEmissions,
    totalEmission: results.totalEmissions,
    ecoScore: results.ecoScore,
    ecoLabel: results.ecoLabel,
    annualEstimate: results.annualEstimate,
    calculatorVersion: '1.0.0',
    datasetVersion: 'legacy-v1',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Retrieves legacy calculation history sorted by newest first. */
export async function getUserCalculations(userId: string): Promise<SavedCalculation[]> {
  if (!userId) return [];
  try {
    const calculationsRef = collection(db, 'calculations');
    const q = query(
      calculationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ calculationId: d.id, ...d.data() } as SavedCalculation));
  } catch (err) {
    console.error('Error fetching legacy user calculations:', err);
    return [];
  }
}

/** Soft-deletes a legacy calculation (removes from community stats but keeps audit trail if needed). */
export async function deleteCalculation(calculationId: string, userId: string): Promise<void> {
  if (!calculationId || !userId) return;
  const calcRef = doc(db, 'calculations', calculationId);
  const snap = await getDoc(calcRef);
  if (!snap.exists()) return;

  const data = snap.data();
  await deleteDoc(calcRef);

  const q = query(collection(db, 'calculations'), where('userId', '==', userId), limit(1));
  const remainingSnap = await getDocs(q);

  await removeCommunityEntry({
    calculationId,
    userId,
    hasRemaining: !remainingSnap.empty,
    removedEmission: data.totalEmission ?? 0,
    removedScore: data.ecoScore ?? 0,
    removedBreakdown: {
      transport: data.transportEmission ?? 0,
      energy: data.energyEmission ?? 0,
      food: data.foodEmission ?? 0,
      waste: data.wasteEmission ?? 0,
    },
  });
}

// ─── V2 Assessment Services ──────────────────────────────────────────────────

/**
 * Saves a v2 scientific assessment to Firestore under users/{uid}/assessments/{id}.
 * Never overwrites existing assessments — always creates new immutable records.
 */
export async function saveV2Assessment(
  userId: string,
  answers: AssessmentAnswers,
  result: V2CalculationResult,
  mode: 'quick' | 'detailed' = 'quick'
): Promise<string> {
  if (!userId) throw new Error('User ID is required to save assessment.');
  const assessmentsRef = collection(db, 'users', userId, 'assessments');
  const docRef = await addDoc(assessmentsRef, {
    userId,
    mode,
    location: {
      country: 'India',
      state: answers.state || 'Delhi',
      district: answers.district || '',
      city: answers.city || '',
      dwelling: answers.dwelling || 'APARTMENT',
      isUrban: answers.isUrban !== false,
    },
    emissions: {
      totalKgCO2PerYear: result.totalKgCO2PerYear,
      totalTonnesCO2PerYear: result.totalTonnesCO2PerYear,
      breakdown: result.breakdown,
      percentages: result.percentages,
    },
    subBreakdown: result.subBreakdown,
    confidence: result.confidence,
    answers: answers,
    aiAdvice: [],
    status: 'approved',
    calculatorVersion: result.metadata.calculatorVersion,
    datasetVersion: result.metadata.datasetVersion,
    aiPromptVersion: '1.0',
    aiModel: 'gemini-flash',
    createdAt: serverTimestamp(),
    timestamp: new Date().toISOString(),
  });
  return docRef.id;
}

/** Retrieves all v2 assessments for a user, normalized for backward compatibility. */
export async function getUserAssessments(userId: string): Promise<NormalizedAssessmentDocument[]> {
  if (!userId) return [];
  try {
    const assessmentsRef = collection(db, 'users', userId, 'assessments');
    const q = query(assessmentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => normalizeAssessmentDocument({ id: d.id, ...d.data() }, d.id));
  } catch (err) {
    console.error('Error fetching v2 user assessments:', err);
    return [];
  }
}

/** Caches AI advice onto an existing assessment document (never creates a new one). */
export async function cacheAiAdvice(userId: string, assessmentId: string, aiAdvice: any[]): Promise<void> {
  if (!userId || !assessmentId) return;
  const assessmentRef = doc(db, 'users', userId, 'assessments', assessmentId);
  await updateDoc(assessmentRef, { aiAdvice, aiAdviceCachedAt: serverTimestamp() });
}

/** Soft-deletes a v2 assessment (sets status to 'deleted' — never permanent delete). */
export async function softDeleteAssessment(userId: string, assessmentId: string): Promise<void> {
  if (!userId || !assessmentId) return;
  const assessmentRef = doc(db, 'users', userId, 'assessments', assessmentId);
  await updateDoc(assessmentRef, { status: 'deleted', deletedAt: serverTimestamp() });
}

export interface UnifiedHistoryItem {
  id: string;
  isV2: boolean;
  date: string;
  timestampMs: number;
  totalKgCO2: number;
  totalTonnesCO2: number;
  breakdown: {
    transport: number;
    energy: number;
    food: number;
    waste: number;
    shopping?: number;
  };
  ecoScore: number;
  confidenceRating?: string;
  confidenceScore?: number;
  mode?: string;
  rawDoc?: any;
}

/** Fetches both v1 calculations and v2 assessments, producing a unified chronological history. */
export async function getUnifiedUserHistory(userId: string): Promise<UnifiedHistoryItem[]> {
  if (!userId) return [];
  try {
    const [v1List, v2List] = await Promise.all([
      getUserCalculations(userId),
      getUserAssessments(userId)
    ]);

    const items: UnifiedHistoryItem[] = [];

    // Process V2 assessments
    for (const doc of v2List) {
      if ((doc as any).status === 'deleted') continue;
      const totalKg = doc.emissions?.totalKgCO2PerYear ?? 0;
      const totalTonnes = doc.emissions?.totalTonnesCO2PerYear ?? Math.round((totalKg / 1000) * 100) / 100;
      const createdTime = doc.timestamp ? new Date(doc.timestamp).getTime() : Date.now();
      const dateStr = new Date(createdTime).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      const ecoScore = calculateEcoScore(totalTonnes).score;

      items.push({
        id: doc.id,
        isV2: true,
        date: dateStr,
        timestampMs: createdTime,
        totalKgCO2: Math.round(totalKg),
        totalTonnesCO2: totalTonnes,
        breakdown: {
          transport: Math.round(doc.emissions?.breakdown?.transport ?? 0),
          energy: Math.round(doc.emissions?.breakdown?.energy ?? 0),
          food: Math.round(doc.emissions?.breakdown?.food ?? 0),
          waste: Math.round(doc.emissions?.breakdown?.waste ?? 0),
          shopping: Math.round(doc.emissions?.breakdown?.shopping ?? 0),
        },
        ecoScore,
        confidenceRating: doc.confidence?.overallRating || 'HIGH',
        confidenceScore: doc.confidence?.overallScore || 85,
        mode: doc.mode || 'quick',
        rawDoc: doc,
      });
    }

    // Process V1 calculations
    for (const calc of v1List) {
      const totalKg = (calc.annualEstimate ?? calc.totalEmission ?? 0) * 1000;
      const totalTonnes = calc.annualEstimate ?? (calc.totalEmission ?? 0);
      const createdTime = calc.createdAt?.toDate?.()?.getTime?.() || Date.now();

      items.push({
        id: calc.calculationId || `v1_${Math.random()}`,
        isV2: false,
        date: calc.date || new Date(createdTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        timestampMs: createdTime,
        totalKgCO2: Math.round(totalKg),
        totalTonnesCO2: Math.round(totalTonnes * 100) / 100,
        breakdown: {
          transport: Math.round(calc.transportEmission || 0),
          energy: Math.round(calc.energyEmission || 0),
          food: Math.round(calc.foodEmission || 0),
          waste: Math.round(calc.wasteEmission || 0),
        },
        ecoScore: calc.ecoScore || 50,
        confidenceRating: 'ESTIMATE',
        confidenceScore: 60,
        mode: 'quick',
        rawDoc: calc,
      });
    }

    // Sort newest first
    return items.sort((a, b) => b.timestampMs - a.timestampMs);
  } catch (err) {
    console.error('Error fetching unified user history:', err);
    return [];
  }
}
