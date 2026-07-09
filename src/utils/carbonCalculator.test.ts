import { describe, it, expect } from 'vitest';
import { calculateCarbonFootprint, getEcoScoreLabel } from './carbonCalculator';

describe('carbonCalculator', () => {
  describe('calculateCarbonFootprint', () => {
    it('calculates minimum emissions correctly (Vegan, Walking, Low Energy, Low Waste)', () => {
      const result = calculateCarbonFootprint({
        transportMode: 'walking',
        weeklyDistance: 0,
        energyUsage: 'low',
        dietType: 'vegan',
        wasteSize: 'low',
      });

      expect(result.transportEmissions).toBe(0);
      expect(result.energyEmissions).toBe(1500); // low energy base
      expect(result.foodEmissions).toBe(1000); // vegan base
      expect(result.wasteEmissions).toBe(300); // low waste base
      expect(result.totalEmissions).toBe(2800);
      expect(result.annualEstimate).toBe(2.8);
    });

    it('calculates maximum emissions correctly (Car, High Energy, Heavy Meat, High Waste)', () => {
      const result = calculateCarbonFootprint({
        transportMode: 'car',
        weeklyDistance: 500, // 500 km * 52 * 0.2
        energyUsage: 'high',
        dietType: 'heavy_meat',
        wasteSize: 'high',
      });

      const expectedTransport = 500 * 52 * 0.2; // 5200
      expect(result.transportEmissions).toBe(expectedTransport);
      expect(result.energyEmissions).toBe(4500);
      expect(result.foodEmissions).toBe(3500);
      expect(result.wasteEmissions).toBe(1200);
      
      const expectedTotal = expectedTransport + 4500 + 3500 + 1200; // 14400
      expect(result.totalEmissions).toBe(expectedTotal);
      expect(result.annualEstimate).toBe(14.4);
    });

    it('calculates public transport correctly', () => {
      const result = calculateCarbonFootprint({
        transportMode: 'public',
        weeklyDistance: 100, // 100 * 52 * 0.05
        energyUsage: 'medium',
        dietType: 'mixed',
        wasteSize: 'medium',
      });

      expect(result.transportEmissions).toBe(100 * 52 * 0.05);
    });

    it('calculates bike correctly (zero transport emissions)', () => {
      const result = calculateCarbonFootprint({
        transportMode: 'bike',
        weeklyDistance: 100,
        energyUsage: 'medium',
        dietType: 'mixed',
        wasteSize: 'medium',
      });

      expect(result.transportEmissions).toBe(0);
    });

    it('handles eco score correctly bounds (high emission = low score)', () => {
      const result = calculateCarbonFootprint({
        transportMode: 'car',
        weeklyDistance: 1000,
        energyUsage: 'high',
        dietType: 'heavy_meat',
        wasteSize: 'high',
      });

      // 1000 * 52 * 0.2 = 10400
      // total = 10400 + 4500 + 3500 + 1200 = 19600
      // Score: Math.max(0, 100 - (19600/10000)*25) => 100 - (1.96 * 25) = 100 - 49 = 51
      expect(result.ecoScore).toBeGreaterThan(0);
      expect(result.ecoScore).toBeLessThan(60);
    });

    it('handles eco score bounds (low emission = high score)', () => {
      const result = calculateCarbonFootprint({
        transportMode: 'walking',
        weeklyDistance: 0,
        energyUsage: 'low',
        dietType: 'vegan',
        wasteSize: 'low',
      });

      // total = 2800
      // Score: 100 - (0.28 * 25) = 100 - 7 = 93
      expect(result.ecoScore).toBeGreaterThan(80);
      expect(result.ecoLabel).toBe('Eco Warrior');
    });
  });

  describe('getEcoScoreLabel', () => {
    it('returns Eco Warrior for 85+', () => {
      expect(getEcoScoreLabel(100)).toBe('Eco Warrior');
      expect(getEcoScoreLabel(85)).toBe('Eco Warrior');
    });
    
    it('returns Climate Conscious for 70-84', () => {
      expect(getEcoScoreLabel(84)).toBe('Climate Conscious');
      expect(getEcoScoreLabel(70)).toBe('Climate Conscious');
    });

    it('returns Average Footprint for 50-69', () => {
      expect(getEcoScoreLabel(69)).toBe('Average Footprint');
      expect(getEcoScoreLabel(50)).toBe('Average Footprint');
    });

    it('returns Needs Improvement for 30-49', () => {
      expect(getEcoScoreLabel(49)).toBe('Needs Improvement');
      expect(getEcoScoreLabel(30)).toBe('Needs Improvement');
    });

    it('returns High Impact for <30', () => {
      expect(getEcoScoreLabel(29)).toBe('High Impact');
      expect(getEcoScoreLabel(0)).toBe('High Impact');
    });
  });
});
