import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CalculatorInputs, CalculationResult, calculateCarbonFootprint, initialInputs } from '../utils/carbonCalculator';

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
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_inputs');
      return saved ? JSON.parse(saved) : initialInputs;
    } catch (error) {
      return initialInputs;
    }
  });

  const [results, setResults] = useState<CalculationResult | null>(() => {
    try {
      const saved = localStorage.getItem('ecotrack_results');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ecotrack_inputs', JSON.stringify(inputs));
    } catch (error) {
      // Ignore local storage errors quietly
    }
  }, [inputs]);

  useEffect(() => {
    try {
      if (results) {
        localStorage.setItem('ecotrack_results', JSON.stringify(results));
      } else {
        localStorage.removeItem('ecotrack_results');
      }
    } catch (error) {
      // Ignore local storage errors quietly
    }
  }, [results]);

  const updateInputs = (updates: Partial<CalculatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  };

  const calculate = () => {
    const computedResults = calculateCarbonFootprint(inputs);
    setResults(computedResults);
    return computedResults;
  };

  const resetCalculator = () => {
    setInputs(initialInputs);
    setResults(null);
    try {
      localStorage.removeItem('ecotrack_inputs');
      localStorage.removeItem('ecotrack_results');
    } catch (error) {
      // Ignore
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
