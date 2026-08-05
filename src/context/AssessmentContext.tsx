import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AssessmentAnswers, CalculationResult, calculateEmissions } from '../utils/calculationEngine';
import { FlightTripEntry } from '../components/calculator/FlightPlanner';
import { ApplianceUsage } from '../components/calculator/ApplianceSelector';

/** Default initial assessment state for a fresh v2 assessment */
export const initialAssessmentAnswers: AssessmentAnswers = {
  // Location
  state: 'Maharashtra',
  district: 'Mumbai Suburban',
  city: 'Mumbai',
  dwelling: 'APARTMENT',
  isUrban: true,
  householdMembers: 3,

  // Energy
  electricityKWhKnown: false,
  electricityKWh: 0,
  monthlyBillRupees: 2000,
  cookingFuel: 'lpg',
  cookingFuelConsumptionMonthly: 1,
  solarInstalledKw: 0,
  appliances: [],

  // Transport (new multi-entry system)
  transportEntries: [],
  // Transport (legacy single vehicle — kept for backward compat)
  ownsVehicle: false,
  vehicleCategoryKey: '',
  dailyVehicleKm: 25,
  vehicleOccupancy: 1,
  publicTransitModes: {
    metroKmWeekly: 0,
    suburbanTrainKmWeekly: 0,
    busKmWeekly: 0,
    autoKmWeekly: 0,
    taxiKmWeekly: 0
  },
  flightDetails: [],

  // Food (new multi-select diet mix)
  dietMix: [],
  // Food (legacy single diet — kept for backward compat)
  dietType: 'lacto_vegetarian',
  foodWasteLevel: 'MODERATE',
  diningOutMealsWeekly: 1,

  // Waste
  wasteSegregation: false,
  compostingOrganic: false,
  recyclingDryWaste: false,

  // Shopping
  apparelItemsMonthly: 1,
  electronicsItemsYearly: 1,
  onlineParcelsMonthly: 4,
  preferSecondHand: false
};

export type AssessmentMode = 'quick' | 'detailed';
export type AssessmentStep = 'location' | 'transport' | 'energy' | 'food' | 'waste' | 'shopping' | 'review';

const DRAFT_STORAGE_KEY = 'ecotrack_assessment_draft_v2';

interface AssessmentDraft {
  answers: AssessmentAnswers;
  currentStep: AssessmentStep;
  mode: AssessmentMode;
  timestamp: number;
}

function loadDraft(): AssessmentDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.answers) return null;
    return parsed as AssessmentDraft;
  } catch {
    return null;
  }
}

function saveDraft(draft: Omit<AssessmentDraft, 'timestamp'>) {
  try {
    sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ ...draft, timestamp: Date.now() })
    );
  } catch {
    // Ignore quota or serialization errors
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

function mapFlightDetailsToEntries(flightDetails?: AssessmentAnswers['flightDetails']): FlightTripEntry[] {
  if (!Array.isArray(flightDetails)) return [];
  return flightDetails.map((f, i) => ({
    id: `flight_restored_${i}_${Date.now()}`,
    depIata: f.depIata || 'DEL',
    arrIata: f.arrIata || 'BOM',
    cabinClass: (f.cabinClass as FlightTripEntry['cabinClass']) || 'ECONOMY',
    isRoundTrip: f.isRoundTrip !== false,
    tripsPerYear: f.tripsPerYear || 1
  }));
}

function mapAppliancesToUsage(appliances?: AssessmentAnswers['appliances']): ApplianceUsage[] {
  if (!Array.isArray(appliances)) return [];
  return appliances.map((a, i) => ({
    id: `app_restored_${i}_${Date.now()}`,
    applianceId: a.applianceId,
    stars: a.stars,
    dailyHours: a.dailyHours
  }));
}

interface AssessmentContextType {
  answers: AssessmentAnswers;
  updateAnswers: (updates: Partial<AssessmentAnswers>) => void;
  result: CalculationResult | null;
  runCalculation: () => CalculationResult;
  isCalculated: boolean;
  assessmentId: string | null;
  setAssessmentId: (id: string | null) => void;
  mode: AssessmentMode;
  setMode: (mode: AssessmentMode) => void;
  currentStep: AssessmentStep;
  setCurrentStep: (step: AssessmentStep) => void;
  resetAssessment: () => void;

  // Flight convenience accessors
  flights: FlightTripEntry[];
  setFlights: (flights: FlightTripEntry[]) => void;

  // Appliance convenience accessors
  appliances: ApplianceUsage[];
  setAppliances: (appliances: ApplianceUsage[]) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialDraft = loadDraft();

  const [answers, setAnswers] = useState<AssessmentAnswers>(
    initialDraft?.answers || { ...initialAssessmentAnswers }
  );
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [mode, setModeState] = useState<AssessmentMode>(
    initialDraft?.mode || 'quick'
  );
  const [currentStep, setCurrentStepState] = useState<AssessmentStep>(
    initialDraft?.currentStep || 'location'
  );

  // Flight entries (mapped into answers.flightDetails)
  const [flights, setFlightsState] = useState<FlightTripEntry[]>(() =>
    mapFlightDetailsToEntries(initialDraft?.answers?.flightDetails)
  );

  const setFlights = useCallback((newFlights: FlightTripEntry[]) => {
    setFlightsState(newFlights);
    setAnswers(prev => {
      const next = {
        ...prev,
        flightDetails: newFlights.map(f => ({
          depIata: f.depIata,
          arrIata: f.arrIata,
          cabinClass: f.cabinClass,
          isRoundTrip: f.isRoundTrip,
          tripsPerYear: f.tripsPerYear
        }))
      };
      saveDraft({ answers: next, currentStep, mode });
      return next;
    });
  }, [currentStep, mode]);

  // Appliance entries (mapped into answers.appliances)
  const [appliancesState, setAppliancesState] = useState<ApplianceUsage[]>(() =>
    mapAppliancesToUsage(initialDraft?.answers?.appliances)
  );

  const setAppliances = useCallback((newAppliances: ApplianceUsage[]) => {
    setAppliancesState(newAppliances);
    setAnswers(prev => {
      const next = {
        ...prev,
        appliances: newAppliances.map(a => ({
          applianceId: a.applianceId,
          stars: a.stars,
          dailyHours: a.dailyHours
        }))
      };
      saveDraft({ answers: next, currentStep, mode });
      return next;
    });
  }, [currentStep, mode]);

  const updateAnswers = useCallback((updates: Partial<AssessmentAnswers>) => {
    setAnswers(prev => {
      const next = { ...prev, ...updates };
      saveDraft({ answers: next, currentStep, mode });
      return next;
    });
  }, [currentStep, mode]);

  const setMode = useCallback((newMode: AssessmentMode) => {
    setModeState(newMode);
    setAnswers(prev => {
      saveDraft({ answers: prev, currentStep, mode: newMode });
      return prev;
    });
  }, [currentStep]);

  const setCurrentStep = useCallback((step: AssessmentStep) => {
    setCurrentStepState(step);
    setAnswers(prev => {
      saveDraft({ answers: prev, currentStep: step, mode });
      return prev;
    });
  }, [mode]);

  const runCalculation = useCallback(() => {
    const computedResult = calculateEmissions(answers);
    setResult(computedResult);
    // Clear draft once calculation succeeds — a completed assessment is no longer a "draft"
    clearDraft();
    return computedResult;
  }, [answers]);

  const resetAssessment = useCallback(() => {
    clearDraft();
    setAnswers({ ...initialAssessmentAnswers });
    setResult(null);
    setAssessmentId(null);
    setFlightsState([]);
    setAppliancesState([]);
    setCurrentStepState('location');
    setModeState('quick');
  }, []);

  return (
    <AssessmentContext.Provider
      value={{
        answers,
        updateAnswers,
        result,
        runCalculation,
        isCalculated: !!result,
        assessmentId,
        setAssessmentId,
        mode,
        setMode,
        currentStep,
        setCurrentStep,
        resetAssessment,
        flights,
        setFlights,
        appliances: appliancesState,
        setAppliances
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
