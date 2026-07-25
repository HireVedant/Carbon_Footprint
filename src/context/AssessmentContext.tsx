import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AssessmentAnswers, CalculationResult, calculateEmissions } from '../utils/calculationEngine';
import { AssessmentDocument } from '../types/rbac';
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

  // Transport
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

  // Food
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
  const [answers, setAnswers] = useState<AssessmentAnswers>({ ...initialAssessmentAnswers });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [mode, setMode] = useState<AssessmentMode>('quick');
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('location');

  // Flight entries (mapped into answers.flightDetails)
  const [flights, setFlightsState] = useState<FlightTripEntry[]>([]);
  const setFlights = useCallback((newFlights: FlightTripEntry[]) => {
    setFlightsState(newFlights);
    setAnswers(prev => ({
      ...prev,
      flightDetails: newFlights.map(f => ({
        depIata: f.depIata,
        arrIata: f.arrIata,
        cabinClass: f.cabinClass,
        isRoundTrip: f.isRoundTrip,
        tripsPerYear: f.tripsPerYear
      }))
    }));
  }, []);

  // Appliance entries (mapped into answers.appliances)
  const [appliances, setAppliancesState] = useState<ApplianceUsage[]>([]);
  const setAppliances = useCallback((newAppliances: ApplianceUsage[]) => {
    setAppliancesState(newAppliances);
    setAnswers(prev => ({
      ...prev,
      appliances: newAppliances.map(a => ({
        applianceId: a.applianceId,
        stars: a.stars,
        dailyHours: a.dailyHours
      }))
    }));
  }, []);

  const updateAnswers = useCallback((updates: Partial<AssessmentAnswers>) => {
    setAnswers(prev => ({ ...prev, ...updates }));
  }, []);

  const runCalculation = useCallback(() => {
    const computedResult = calculateEmissions(answers);
    setResult(computedResult);
    return computedResult;
  }, [answers]);

  const resetAssessment = useCallback(() => {
    setAnswers({ ...initialAssessmentAnswers });
    setResult(null);
    setAssessmentId(null);
    setFlightsState([]);
    setAppliancesState([]);
    setCurrentStep('location');
    setMode('quick');
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
        appliances,
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
