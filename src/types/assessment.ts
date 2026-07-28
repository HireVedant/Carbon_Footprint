/**
 * Assessment Types — Single source of truth for all assessment-related types.
 * @module types/assessment
 */

// ── Transport ─────────────────────────────────────────────────────────────────

export interface TransportEntry {
  modeId: string;
  dailyKm: number;
  occupancy?: number;
  label?: string; // Added for compatibility with transportConfig
}

export interface FlightTripInput {
  depIata: string;
  arrIata: string;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  isRoundTrip: boolean;
  tripsPerYear: number;
}

export interface PublicTransitModes {
  metroKmWeekly?: number;
  suburbanTrainKmWeekly?: number;
  busKmWeekly?: number;
  autoKmWeekly?: number;
  taxiKmWeekly?: number;
}

// ── Energy ────────────────────────────────────────────────────────────────────

export interface ApplianceUsageInput {
  applianceId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  dailyHours: number;
}

// ── Food ──────────────────────────────────────────────────────────────────────

export interface DietMixEntry {
  foodId: string;
  weight: number;
  label?: string; // Added for compatibility with foodConfig
}

// ── Core Assessment Answers ───────────────────────────────────────────────────

export interface AssessmentAnswers {
  // Location
  state?: string;
  district?: string;
  city?: string;
  dwelling?: 'APARTMENT' | 'INDEPENDENT_HOUSE' | 'VILLA' | 'HOSTEL' | 'PG' | 'RENTAL';
  isUrban?: boolean;
  householdMembers?: number;

  // Energy
  electricityKWhKnown?: boolean;
  electricityKWh?: number;
  monthlyBillRupees?: number;
  cookingFuel?: 'lpg' | 'png' | 'induction' | 'biomass';
  cookingFuelConsumptionMonthly?: number;
  solarInstalledKw?: number;
  appliances?: ApplianceUsageInput[];

  // Transport — Legacy
  ownsVehicle?: boolean;
  vehicleCategoryKey?: string;
  dailyVehicleKm?: number;
  vehicleOccupancy?: number;
  // Transport — Multi-entry
  transportEntries?: TransportEntry[];

  // Public Transit
  publicTransitModes?: PublicTransitModes;
  flightDetails?: FlightTripInput[];

  // Food — Legacy
  dietType?: 'vegan' | 'lacto_vegetarian' | 'eggetarian' | 'pescatarian' | 'chicken_moderate' | 'mixed_non_veg' | 'other_diet';
  // Food — Multi-select
  dietMix?: DietMixEntry[];

  foodWasteLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  diningOutMealsWeekly?: number;

  // Waste
  wasteSegregation?: boolean;
  compostingOrganic?: boolean;
  recyclingDryWaste?: boolean;

  // Shopping
  apparelItemsMonthly?: number;
  electronicsItemsYearly?: number;
  onlineParcelsMonthly?: number;
  preferSecondHand?: boolean;
}

// ── Sector Breakdown ──────────────────────────────────────────────────────────

export interface SectorBreakdown {
  transport: number;
  energy: number;
  food: number;
  waste: number;
  shopping: number;
}

// ── Sub-breakdown ─────────────────────────────────────────────────────────────

export interface SubBreakdown {
  electricity: number;
  cookingFuel: number;
  appliances: number;
  vehicles: number;
  flights: number;
  publicTransit: number;
}

// ── Confidence ────────────────────────────────────────────────────────────────

export interface CategoryConfidence {
  score: number;
  rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
  rationales: string[];
}

export interface AssessmentConfidenceBreakdown {
  overallScore: number;
  overallRating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
  transport: CategoryConfidence;
  energy: CategoryConfidence;
  food: CategoryConfidence;
  waste: CategoryConfidence;
  shopping: CategoryConfidence;
}

// ── Calculation Result ────────────────────────────────────────────────────────

export interface CalculationMetadata {
  calculatorVersion: string;
  datasetVersion: string;
  calculatedAt: string;
  gridFactorUsed: number;
  state: string;
}

export interface CalculationResult {
  totalKgCO2PerYear: number;
  totalTonnesCO2PerYear: number;
  breakdown: SectorBreakdown;
  percentages: SectorBreakdown;
  subBreakdown: SubBreakdown;
  confidence: AssessmentConfidenceBreakdown;
  metadata: CalculationMetadata;
}

// ── Recommendation ────────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'waste' | 'shopping';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  estimatedReductionKgCO2: number;
  difficulty: 'EASY' | 'MODERATE' | 'HARD';
  source?: string;
}

// ── AI Layer ──────────────────────────────────────────────────────────────────

export interface AIAnalysisInput {
  breakdown: SectorBreakdown;
  percentages: SectorBreakdown;
  state: string;
  dwelling?: string;
  confidence: AssessmentConfidenceBreakdown;
  topContributors: Array<{ category: string; percentage: number }>;
  totalKgCO2: number;
}

export interface AIAnalysisResult {
  explanation: string;
  tips: string[];
  regionAdvice: string[];
  estimatedReductionPotential: string;
  educationalInsights: string[];
}

// ── Eco Score ─────────────────────────────────────────────────────────────────

export interface EcoScoreResult {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  label: string;
  percentile: number;
}