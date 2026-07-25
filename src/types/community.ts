// ─────────────────────────────────────────────────────────────────────────────
// Community Analytics Type Definitions
// EcoTrack AI — Community Analytics v3.0
//
// Collection Schemas & Units of Measurement:
//   - communityStats/global: Aggregated totals and averages.
//       totalCO2Tracked: measured in kilograms (kg)
//       averageAnnualCO2: measured in metric tons (t/year)
//       emissionBreakdown: array of kg values
//   - communityLeaderboard/{userId}: User's highest score.
//       annualEstimate: measured in metric tons (t/year)
//   - communityReports/{calculationId}: Anonymized reports.
//       annualEstimate: measured in metric tons (t/year)
// ─────────────────────────────────────────────────────────────────────────────

/** Aggregated platform-wide emission breakdown by category (kg CO₂/year). */
export interface EmissionBreakdown {
  transport: number;
  energy: number;
  food: number;
  waste: number;
}

/**
 * Single aggregated document stored at communityStats/global.
 * Designed for 1 Firestore read per page load.
 */
export interface CommunityStats {
  totalUsers: number;
  totalReports: number;
  totalCO2Tracked: number;     // kg CO₂
  averageAnnualCO2: number;    // tons CO₂/year
  averageEcoScore: number;
  emissionBreakdown: EmissionBreakdown;
  updatedAt: Date | null;
}

/**
 * Privacy-safe leaderboard entry — no email, no uid in document body.
 * Stored in communityLeaderboard/{userId}.
 */
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  ecoScore: number;
  annualEstimate: number;      // tons CO₂/year
  ecoLabel: string;
  highestCategory: string;     // "Transport" | "Energy" | "Food" | "Waste"
  isAnonymous: boolean;
  updatedAt: Date | null;
}


/** A dynamic insight string with an optional source tag. */
export interface CommunityInsight {
  id: string;
  text: string;
  source: 'sei' | 'live';
  icon: string;                // emoji
}

// ─────────────────────────────────────────────────────────────────────────────
// SEI Dataset Types
// ─────────────────────────────────────────────────────────────────────────────

/** One of the 10 detailed case studies from the SEI survey. */
export interface SEICaseStudy {
  id: number;
  profile: string;
  annualCO2: number;           // tons
  ecoScore: number;
  ecoLabel: string;
  primaryCategory: string;     // dominant emission category
}

/** Aggregated survey statistics (percentages, 0–100). */
export interface SEISurveyStats {
  totalParticipants: number;
  petrolUsers: number;
  dailyCommute: number;
  electricity150to250: number;
  acUsage4hrs: number;
  nonVegetarian: number;
  foodWaste: number;
  noWasteSegregation: number;
  noComposting: number;
  lowCarbonAwareness: number;
  willingToUseEcoTrack: number;
}

/** Emission distribution percentages summing to 100. */
export interface SEIEmissionDistribution {
  transport: number;
  energy: number;
  food: number;
  waste: number;
}

/** Derived aggregate metrics computed from case studies. */
export interface SEIDerivedMetrics {
  totalAnnualCO2: number;      // tons
  averageAnnualCO2: number;    // tons
  averageEcoScore: number;
  highestEcoScore: number;
  lowestEcoScore: number;
  bestPerformer: string;
  highestEmitter: string;
}

/** Full SEI dataset structure. */
export interface SEIDataset {
  surveyStats: SEISurveyStats;
  emissionDistribution: SEIEmissionDistribution;
  caseStudies: SEICaseStudy[];
  derivedMetrics: SEIDerivedMetrics;
}

/** Stat card definition used in Home/About pages. */
export interface StatCardDef {
  value: string;
  label: string;
  subtitle: string;
}
