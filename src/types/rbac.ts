/**
 * EcoTrack AI — Role-Based Access Control (RBAC) Type Definitions
 */

export type UserRole = 'user' | 'moderator' | 'admin' | 'owner';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isTestAccount: boolean;
  isEmailVerified: boolean;
  isSuspended: boolean;
  state?: string;
  district?: string;
  city?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AssessmentDocument {
  id: string;
  userId: string;
  timestamp: string;
  calculatorVersion: string;
  datasetVersion: string;
  aiPromptVersion: string;
  aiModel: string;
  mode: 'quick' | 'detailed';
  location: {
    country: string;
    state: string;
    district?: string;
    city?: string;
    dwelling?: string;
    isUrban?: boolean;
  };
  emissions: {
    totalKgCO2PerYear: number;
    totalTonnesCO2PerYear: number;
    breakdown: {
      transport: number;
      energy: number;
      food: number;
      waste: number;
      shopping: number;
    };
    percentages?: {
      transport: number;
      energy: number;
      food: number;
      waste: number;
      shopping: number;
    };
  };
  confidence: {
    overallScore: number;
    overallRating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
    transport?: { score: number; rating: string; rationales?: string[] };
    energy?: { score: number; rating: string; rationales?: string[] };
    food?: { score: number; rating: string; rationales?: string[] };
    waste?: { score: number; rating: string; rationales?: string[] };
    shopping?: { score: number; rating: string; rationales?: string[] };
  };
  answers: Record<string, any>;
  aiAdvice: AiRecommendation[];
  status: 'approved' | 'pending_review' | 'rejected' | 'deleted';
  moderationNotes?: string;
  isTestAccount?: boolean;
}

export interface AiRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedReductionKgCO2: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  costImplication: 'SAVINGS' | 'LOW' | 'MODERATE' | 'HIGH';
  impactRank: number;
  confidencePercent: number;
  category: 'transport' | 'energy' | 'food' | 'waste' | 'shopping';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUid: string;
  adminEmail: string;
  action: AuditAction;
  target: string;
  details: Record<string, any>;
}

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'DATASET_UPDATE'
  | 'DATASET_ACTIVATE'
  | 'DATASET_ROLLBACK'
  | 'ROLE_CHANGE'
  | 'USER_SUSPEND'
  | 'USER_UNSUSPEND'
  | 'USER_DELETE'
  | 'USER_SOFT_DELETE'
  | 'USER_PREFERENCES_RESET'
  | 'ASSESSMENT_APPROVE'
  | 'ASSESSMENT_REJECT'
  | 'ASSESSMENT_FLAG'
  | 'ASSESSMENT_RESTORE'
  | 'NEWSLETTER_SEND'
  | 'NEWSLETTER_CANCEL'
  | 'TEST_ACCOUNT_CREATE'
  | 'OWNER_CHANGE'
  | 'PROMPT_INJECTION_DETECTED'
  | 'AI_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'REPORT_GENERATION_FAILURE';

/** Checks if a role has admin-level access */
export function hasAdminAccess(role?: UserRole): boolean {
  return role === 'admin' || role === 'owner';
}

/** Checks if a role has moderator-level access */
export function hasModeratorAccess(role?: UserRole): boolean {
  return role === 'moderator' || role === 'admin' || role === 'owner';
}

/** Checks if a role has owner-level access */
export function hasOwnerAccess(role?: UserRole): boolean {
  return role === 'owner';
}

/** Disposable email domains that should be blocked for regular signups */
export const BLOCKED_EMAIL_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'dispostable.com', 'maildrop.cc', 'temp-mail.org', 'getnada.com',
  'trashmail.com', 'fakeinbox.com', 'tempail.com', '10minutemail.com',
  'burnermail.io', 'disposableemailaddresses.emailmiser.com'
];

/** Check if email domain is disposable */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  return BLOCKED_EMAIL_DOMAINS.includes(domain);
}
