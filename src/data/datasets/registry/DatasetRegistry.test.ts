/**
 * DatasetRegistry Unit Test Suite — EcoTrack AI Phase 7A
 *
 * Tests core registry behavior in isolation (singleton, register, get,
 * deprecate, rollback, validate, getSummary, structural validation).
 *
 * Each unit test resets the singleton in beforeEach for clean state.
 * Auto-registration integration tests are in DatasetRegistry.integration.test.ts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DatasetRegistry,
  validateDatasetObject,
  type RegisteredDataset,
} from './DatasetRegistry';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeDataset(overrides: Partial<RegisteredDataset> = {}): Omit<RegisteredDataset, 'registeredAt' | 'validationErrors'> {
  return {
    id: 'test_dataset',
    displayName: 'Test Dataset',
    version: 'TEST-2026.1',
    source: 'Test Source Organization',
    publicationDate: '2024-01-01',
    updateDate: '2026-01-01',
    units: 'kg CO2e / unit',
    category: 'ELECTRICITY',
    status: 'active',
    data: {
      datasetVersion: 'TEST-2026.1',
      source: 'Test Source Organization',
      publicationDate: '2024-01-01',
      updateDate: '2026-01-01',
    },
    ...overrides,
  };
}

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('DatasetRegistry', () => {

  // Reset singleton between each test for isolation
  beforeEach(() => {
    DatasetRegistry._resetForTests();
  });

  // ── Singleton ──────────────────────────────────────────────────────────────

  describe('Singleton', () => {
    it('returns the same instance on multiple calls', () => {
      const a = DatasetRegistry.getInstance();
      const b = DatasetRegistry.getInstance();
      expect(a).toBe(b);
    });

    it('starts with an empty registry', () => {
      const reg = DatasetRegistry.getInstance();
      expect(reg.size).toBe(0);
      expect(reg.getAll()).toHaveLength(0);
    });
  });

  // ── Registration ───────────────────────────────────────────────────────────

  describe('register()', () => {
    it('registers a valid dataset and marks it active', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset());
      expect(reg.has('test_dataset')).toBe(true);
      expect(reg.get('test_dataset').status).toBe('active');
    });

    it('increments size on each unique registration', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ id: 'ds_a' }));
      reg.register(makeDataset({ id: 'ds_b' }));
      expect(reg.size).toBe(2);
    });

    it('records registeredAt as a valid ISO string', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset());
      const entry = reg.get('test_dataset');
      expect(() => new Date(entry.registeredAt)).not.toThrow();
      expect(new Date(entry.registeredAt).getTime()).toBeGreaterThan(0);
    });

    it('stores the previous version when re-registering the same id', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ version: 'TEST-2025.1' }));
      reg.register(makeDataset({ version: 'TEST-2026.1' }));
      const entry = reg.get('test_dataset');
      expect(entry.version).toBe('TEST-2026.1');
      expect(entry.previousVersion?.version).toBe('TEST-2025.1');
    });

    it('marks dataset as pending_validation when data is missing required fields', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ data: { name: 'incomplete' } }));
      const entry = reg.get('test_dataset');
      expect(entry.status).toBe('pending_validation');
      expect(entry.validationErrors).toBeDefined();
      expect((entry.validationErrors as string[]).length).toBeGreaterThan(0);
    });
  });

  // ── get() ──────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('throws a descriptive error for unregistered dataset id', () => {
      const reg = DatasetRegistry.getInstance();
      expect(() => reg.get('nonexistent')).toThrowError(/nonexistent/);
      expect(() => reg.get('nonexistent')).toThrowError(/DatasetRegistry/);
    });

    it('returns the correct entry for a registered id', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ displayName: 'My Special Dataset' }));
      const entry = reg.get('test_dataset');
      expect(entry.displayName).toBe('My Special Dataset');
    });
  });

  // ── getAll() / getByCategory() ─────────────────────────────────────────────

  describe('getAll() and getByCategory()', () => {
    it('returns all registered entries', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ id: 'a', category: 'ELECTRICITY' }));
      reg.register(makeDataset({ id: 'b', category: 'FOOD' }));
      reg.register(makeDataset({ id: 'c', category: 'ELECTRICITY' }));
      expect(reg.getAll()).toHaveLength(3);
    });

    it('filters correctly by category', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ id: 'a', category: 'ELECTRICITY' }));
      reg.register(makeDataset({ id: 'b', category: 'FOOD' }));
      reg.register(makeDataset({ id: 'c', category: 'ELECTRICITY' }));
      const elec = reg.getByCategory('ELECTRICITY');
      expect(elec).toHaveLength(2);
      expect(elec.every(d => d.category === 'ELECTRICITY')).toBe(true);
    });
  });

  // ── deprecate() ────────────────────────────────────────────────────────────

  describe('deprecate()', () => {
    it('marks a dataset as deprecated', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset());
      reg.deprecate('test_dataset');
      expect(reg.get('test_dataset').status).toBe('deprecated');
    });

    it('throws when deprecating an unregistered dataset', () => {
      const reg = DatasetRegistry.getInstance();
      expect(() => reg.deprecate('unknown')).toThrow();
    });
  });

  // ── rollback() ─────────────────────────────────────────────────────────────

  describe('rollback()', () => {
    it('returns false when no previous version exists', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset());
      expect(reg.rollback('test_dataset')).toBe(false);
    });

    it('restores the previous version and sets status to rollback', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ version: 'TEST-2025.1' }));
      reg.register(makeDataset({ version: 'TEST-2026.1' }));
      const success = reg.rollback('test_dataset');
      expect(success).toBe(true);
      const restored = reg.get('test_dataset');
      expect(restored.version).toBe('TEST-2025.1');
      expect(restored.status).toBe('rollback');
    });
  });

  // ── validate() ─────────────────────────────────────────────────────────────

  describe('validate()', () => {
    it('marks a previously pending dataset as active after fixing data', () => {
      const reg = DatasetRegistry.getInstance();
      // Register with bad data first
      reg.register(makeDataset({ data: {} }));
      expect(reg.get('test_dataset').status).toBe('pending_validation');

      // Inject corrected data directly (simulating dataset update)
      const entry = reg.get('test_dataset') as any;
      entry.data = makeDataset().data;
      reg['registry'].set('test_dataset', entry);

      expect(reg.validate('test_dataset')).toBe(true);
      expect(reg.get('test_dataset').status).toBe('active');
    });

    it('returns false and keeps pending status when data is still invalid', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ data: { name: 'still broken' } }));
      expect(reg.validate('test_dataset')).toBe(false);
      expect(reg.get('test_dataset').status).toBe('pending_validation');
    });
  });

  // ── getSummary() ───────────────────────────────────────────────────────────

  describe('getSummary()', () => {
    it('returns correct counts by status', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset({ id: 'a' }));
      reg.register(makeDataset({ id: 'b' }));
      reg.register(makeDataset({ id: 'c', data: {} })); // pending
      reg.deprecate('b');

      const summary = reg.getSummary();
      expect(summary.totalDatasets).toBe(3);
      expect(summary.activeCount).toBe(1);
      expect(summary.deprecatedCount).toBe(1);
      expect(summary.pendingCount).toBe(1);
    });

    it('summary dataset entries include required display fields', () => {
      const reg = DatasetRegistry.getInstance();
      reg.register(makeDataset());
      const { datasets } = reg.getSummary();
      expect(datasets).toHaveLength(1);
      expect(datasets[0]).toMatchObject({
        id: 'test_dataset',
        displayName: 'Test Dataset',
        version: 'TEST-2026.1',
        status: 'active',
        hasValidationErrors: false,
      });
    });
  });

});

// ─── Structural Validation Unit Tests ─────────────────────────────────────────

describe('validateDatasetObject()', () => {

  it('returns no errors for a fully valid dataset object', () => {
    const errors = validateDatasetObject({
      datasetVersion: 'V1.0',
      source: 'Test Source',
      publicationDate: '2024-01-01',
      updateDate: '2025-01-01',
    });
    expect(errors).toHaveLength(0);
  });

  it('returns errors for missing required fields', () => {
    const errors = validateDatasetObject({ datasetVersion: 'V1.0' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('source'))).toBe(true);
  });

  it('returns an error for non-object input', () => {
    expect(validateDatasetObject(null)).toHaveLength(1);
    expect(validateDatasetObject(undefined)).toHaveLength(1);
    expect(validateDatasetObject('string')).toHaveLength(1);
  });

  it('returns errors for empty string required fields', () => {
    const errors = validateDatasetObject({
      datasetVersion: '',
      source: '   ',
      publicationDate: '2024-01-01',
      updateDate: '2025-01-01',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

});

// Integration tests are in DatasetRegistry.integration.test.ts
// (isolated to avoid conflicts with the singleton reset in beforeEach above)
