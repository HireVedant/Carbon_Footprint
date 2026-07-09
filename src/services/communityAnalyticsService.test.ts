import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCommunityAggregates, removeCommunityEntry } from './communityAnalyticsService';

// Mock Firebase dependencies
vi.mock('../firebase/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => {
  const transactionMock = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  return {
    doc: vi.fn((db, col, id) => `${col}/${id}`),
    collection: vi.fn((db, col) => col),
    serverTimestamp: vi.fn(() => 'TIMESTAMP'),
    runTransaction: vi.fn(async (db, callback) => {
      await callback(transactionMock);
    }),
    onSnapshot: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    Timestamp: {
      now: vi.fn(),
    },
  };
});

import { runTransaction } from 'firebase/firestore';

describe('communityAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateCommunityAggregates', () => {
    it('runs a transaction to update aggregates and writes a new report', async () => {
      // We need to capture the transaction object passed to the callback
      const mockGet = vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({
          totalReports: 10,
          totalCO2Tracked: 10000,
          averageEcoScore: 50,
          emissionBreakdown: { transport: 100, energy: 100, food: 100, waste: 100 },
        }),
      });

      const mockSet = vi.fn();
      
      // Override runTransaction implementation just for this test to inject our mock methods
      (runTransaction as any).mockImplementationOnce(async (db: any, cb: any) => {
        await cb({ get: mockGet, set: mockSet });
      });

      await updateCommunityAggregates({
        userId: 'user1',
        calculationId: 'calc1',
        displayName: 'Test User',
        transportEmission: 100,
        energyEmission: 200,
        foodEmission: 300,
        wasteEmission: 400,
        totalEmission: 1000,
        ecoScore: 80,
        ecoLabel: 'Good',
        annualEstimate: 1.0,
        totalUsers: 5,
      });

      expect(mockGet).toHaveBeenCalledTimes(2); // communityStats, leaderboard
      expect(mockSet).toHaveBeenCalledTimes(3); // stats, leaderboard, report
    });
  });

  describe('removeCommunityEntry', () => {
    it('runs a transaction to decrement aggregates when a report is deleted', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({
          totalReports: 2,
          totalCO2Tracked: 2000,
          averageEcoScore: 50,
          emissionBreakdown: { transport: 1000, energy: 1000, food: 0, waste: 0 },
        }),
      });

      const mockSet = vi.fn();
      const mockDelete = vi.fn();
      
      (runTransaction as any).mockImplementationOnce(async (db: any, cb: any) => {
        await cb({ get: mockGet, set: mockSet, delete: mockDelete });
      });

      await removeCommunityEntry({
        calculationId: 'calc1',
        userId: 'user1',
        hasRemaining: false,
        removedEmission: 1000,
        removedScore: 80,
        removedBreakdown: { transport: 500, energy: 500, food: 0, waste: 0 },
      });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledTimes(1); // Set decremented stats
      expect(mockDelete).toHaveBeenCalledTimes(2); // Delete report, delete leaderboard (since hasRemaining is false)
    });
  });
});
