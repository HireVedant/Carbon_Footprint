import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { CalculatorProvider, useCalculator } from './CalculatorContext';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'user123', displayName: 'Test User' },
    userProfile: { name: 'Test User' },
  }),
}));

// Mock Firestore services
vi.mock('../firebase/firestore', () => ({
  saveCalculation: vi.fn().mockResolvedValue('calc123'),
}));

vi.mock('../services/communityAnalyticsService', () => ({
  updateCommunityAggregates: vi.fn().mockResolvedValue(undefined),
  subscribeToCommunityStats: vi.fn(() => () => {}),
}));

const TestComponent = () => {
  const { 
    answers, 
    updateAnswer, 
    results, 
    isCalculating,
    calculate 
  } = useCalculator();

  return (
    <div>
      <div data-testid="transport-mode">{answers.transportMode}</div>
      <div data-testid="results">{results ? 'Has Results' : 'No Results'}</div>
      <div data-testid="loading">{isCalculating ? 'Calculating' : 'Idle'}</div>
      
      <button onClick={() => updateAnswer('transportMode', 'bike')}>Set Bike</button>
      <button onClick={() => calculate(100)}>Calculate</button>
    </div>
  );
};

describe('CalculatorContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates answers correctly', () => {
    render(
      <CalculatorProvider>
        <TestComponent />
      </CalculatorProvider>
    );

    expect(screen.getByTestId('transport-mode')).toHaveTextContent('car');
    
    fireEvent.click(screen.getByText('Set Bike'));
    
    expect(screen.getByTestId('transport-mode')).toHaveTextContent('bike');
  });

  it('calculates and saves results', async () => {
    render(
      <CalculatorProvider>
        <TestComponent />
      </CalculatorProvider>
    );

    expect(screen.getByTestId('results')).toHaveTextContent('No Results');
    
    await act(async () => {
      fireEvent.click(screen.getByText('Calculate'));
    });

    expect(screen.getByTestId('results')).toHaveTextContent('Has Results');
  });
});
