import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CalculatorInputs, CalculationResult, calculateCarbonFootprint, initialInputs } from '../utils/carbonCalculator';
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

  // Sync state with logged in user
  useEffect(() => {
    if (!user) {
      setInputs(initialInputs);
      setResults(null);
      return;
    }

    const loadUserData = async () => {
      try {
        const uid = user.uid;
        
        // Load inputs from local storage (uid-specific)
        const savedInputs = localStorage.getItem(`ecotrack_inputs_${uid}`);
        if (savedInputs) {
          setInputs(JSON.parse(savedInputs));
        } else {
          setInputs(initialInputs);
        }

        // Load results from local storage (uid-specific) first for speed
        const savedResults = localStorage.getItem(`ecotrack_results_${uid}`);
        if (savedResults) {
          setResults(JSON.parse(savedResults));
        } else {
          // Fallback to firestore if no local results
          const history = await getUserCalculations(uid);
          if (history.length > 0) {
            const latest = history[0];
            // Compute ecoColor from score using dummy input just for color logic if needed,
            // or just reconstruct result. We can recalculate or just assign.
            // But we actually only need to reconstruct the CalculationResult.
            // Since calculateCarbonFootprint doesn't depend on inputs for the score label assignment logic directly,
            // we'll just reconstruct the missing fields.
            
            let ecoColor = '';
            if (latest.ecoScore >= 85) {
              ecoColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            } else if (latest.ecoScore >= 70) {
              ecoColor = 'text-green-400 border-green-500/30 bg-green-500/10';
            } else if (latest.ecoScore >= 50) {
              ecoColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            } else if (latest.ecoScore >= 30) {
              ecoColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
            } else {
              ecoColor = 'text-red-400 border-red-500/30 bg-red-500/10';
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
          } else {
            setResults(null);
          }
        }
      } catch (e) {
        console.error('Error loading user data', e);
      }
    };
    
    loadUserData();
  }, [user]);

  // Save inputs locally for this user
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(`ecotrack_inputs_${user.uid}`, JSON.stringify(inputs));
    } catch (error) {
      // Ignore local storage errors quietly
    }
  }, [inputs, user]);

  // Save results locally for this user
  useEffect(() => {
    if (!user) return;
    try {
      if (results) {
        localStorage.setItem(`ecotrack_results_${user.uid}`, JSON.stringify(results));
      } else {
        localStorage.removeItem(`ecotrack_results_${user.uid}`);
      }
    } catch (error) {
      // Ignore local storage errors quietly
    }
  }, [results, user]);

  const updateInputs = (updates: Partial<CalculatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  };

  const calculate = () => {
    const computedResults = calculateCarbonFootprint(inputs);
    setResults(computedResults);
    
    if (user) {
      // Asynchronously save to Firestore then update community aggregates
      saveCalculation(user.uid, computedResults)
        .then(async (calculationId) => {
          // Fetch current total user count for the community stats doc
          let totalUsers = 1;
          try {
            const usersCol = collection(db, 'users');
            const countSnap = await getCountFromServer(usersCol);
            totalUsers = countSnap.data().count;
          } catch {
            // Non-fatal — use fallback of 1
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
        .catch(err => {
          console.error('Failed to save calculation to firestore', err);
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
      } catch (error) {
        // Ignore
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
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
