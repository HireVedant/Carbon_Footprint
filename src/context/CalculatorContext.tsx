import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  CalculatorInputs,
  CalculationResult,
  calculateCarbonFootprint,
  initialInputs,
  mergeCalculatorInputs,
} from '../utils/carbonCalculator';
import { useAuth } from './AuthContext';
import { saveCalculation, getUserCalculations } from '../firebase/firestore';
import { updateCommunityAggregates } from '../services/communityAnalyticsService';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface CalculatorContextType {
  inputs: CalculatorInputs;
  updateInputs: (updates: Partial<CalculatorInputs>) => void;
  results: CalculationResult | null;
  calculate: () => CalculationResult;
  isCalculated: boolean;
  resetCalculator: () => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [inputs, setInputs] = useState<CalculatorInputs>(initialInputs);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setHydratedUserId(null);
      setInputs(initialInputs);
      setResults(null);
      return;
    }

    const uid = user.uid;
    let isActive = true;

    setHydratedUserId(null);
    setInputs(initialInputs);
    setResults(null);

    const loadUserData = async () => {
      try {
        const savedInputs = localStorage.getItem(`ecotrack_inputs_${uid}`);

        if (savedInputs) {
          try {
            const parsedInputs = JSON.parse(savedInputs) as Partial<CalculatorInputs>;
            if (isActive) {
              setInputs(mergeCalculatorInputs(parsedInputs));
            }
          } catch {
            if (isActive) {
              setInputs(initialInputs);
            }
          }
        }

        const savedResults = localStorage.getItem(`ecotrack_results_${uid}`);

        if (savedResults) {
          try {
            const parsedResults = JSON.parse(savedResults) as CalculationResult;
            if (isActive) {
              setResults(parsedResults);
            }
          } catch {
            if (isActive) {
              setResults(null);
            }
          }
        } else {
          const history = await getUserCalculations(uid);

          if (!isActive) return;

          if (history.length > 0) {
            const latest = history[0];

            let ecoColor = '';

            if (latest.ecoScore >= 85) {
              ecoColor = 'text-emerald-700 border-emerald-500/30 bg-emerald-500/10';
            } else if (latest.ecoScore >= 70) {
              ecoColor = 'text-green-700 border-green-500/30 bg-green-500/10';
            } else if (latest.ecoScore >= 50) {
              ecoColor = 'text-amber-700 border-amber-500/30 bg-amber-500/10';
            } else if (latest.ecoScore >= 30) {
              ecoColor = 'text-orange-700 border-orange-500/30 bg-orange-500/10';
            } else {
              ecoColor = 'text-red-700 border-red-500/30 bg-red-500/10';
            }

            setResults({
              transportEmissions: latest.transportEmission,
              energyEmissions: latest.energyEmission,
              foodEmissions: latest.foodEmission,
              wasteEmissions: latest.wasteEmission,
              totalEmissions: latest.totalEmission,
              annualEstimate: latest.annualEstimate,
              ecoScore: latest.ecoScore,
              ecoLabel: latest.ecoLabel,
              ecoColor,
            });
          }
        }
      } catch (error) {
        console.error('Error loading user data', error);
      } finally {
        if (isActive) {
          setHydratedUserId(uid);
        }
      }
    };

    loadUserData();

    return () => {
      isActive = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || hydratedUserId !== user.uid) return;

    try {
      localStorage.setItem(
        `ecotrack_inputs_${user.uid}`,
        JSON.stringify(inputs)
      );
    } catch {
      // Ignore local storage errors
    }
  }, [inputs, user?.uid, hydratedUserId]);

  useEffect(() => {
    if (!user?.uid || hydratedUserId !== user.uid) return;

    try {
      if (results) {
        localStorage.setItem(
          `ecotrack_results_${user.uid}`,
          JSON.stringify(results)
        );
      } else {
        localStorage.removeItem(`ecotrack_results_${user.uid}`);
      }
    } catch {
      // Ignore local storage errors
    }
  }, [results, user?.uid, hydratedUserId]);

  const updateInputs = (updates: Partial<CalculatorInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const calculate = () => {
    const computedResults = calculateCarbonFootprint(inputs);

    setResults(computedResults);

    if (user) {
      saveCalculation(user.uid, computedResults)
        .then(async (calculationId) => {
          let totalUsers = 1;

          try {
            const usersCollection = collection(db, 'users');
            const countSnapshot = await getCountFromServer(usersCollection);
            totalUsers = countSnapshot.data().count;
          } catch {
            // Non-fatal; use fallback value.
          }

          await updateCommunityAggregates({
            userId: user.uid,
            calculationId,
            displayName: user.displayName ?? '',
            transportEmission: computedResults.transportEmissions,
            energyEmission: computedResults.energyEmissions,
            foodEmission: computedResults.foodEmissions,
            wasteEmission: computedResults.wasteEmissions,
            totalEmission: computedResults.totalEmissions,
            ecoScore: computedResults.ecoScore,
            ecoLabel: computedResults.ecoLabel,
            annualEstimate: computedResults.annualEstimate,
            totalUsers,
          });
        })
        .catch((error) => {
          console.error('Failed to save calculation to Firestore', error);
        });
    }

    return computedResults;
  };

  const resetCalculator = () => {
    setInputs(initialInputs);
    setResults(null);

    if (user) {
      try {
        localStorage.removeItem(`ecotrack_inputs_${user.uid}`);
        localStorage.removeItem(`ecotrack_results_${user.uid}`);
      } catch {
        // Ignore local storage errors
      }
    }
  };

  return (
    <CalculatorContext.Provider
      value={{
        inputs,
        updateInputs,
        results,
        calculate,
        isCalculated: !!results,
        resetCalculator,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);

  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }

  return context;
};
