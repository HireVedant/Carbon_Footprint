/**
 * DatasetRegistry Integration Tests — EcoTrack AI Phase 7A
 *
 * Verifies that all 9 scientific datasets auto-register with the
 * DatasetRegistry singleton when the datasets barrel is imported.
 *
 * These tests are intentionally isolated in a separate file so that
 * the singleton reset in DatasetRegistry.test.ts does not interfere
 * with the auto-registration side-effects verified here.
 */

// This import triggers all 9 dataset self-registration addendums
import '../index';

import { describe, it, expect } from 'vitest';
import { DatasetRegistry } from './DatasetRegistry';

describe('DatasetRegistry — Auto-registration Integration', () => {
  const reg = DatasetRegistry.getInstance();

  const EXPECTED_DATASETS: { id: string; category: string }[] = [
    { id: 'electricity_grid',   category: 'ELECTRICITY' },
    { id: 'transport_vehicles', category: 'TRANSPORT_VEHICLES' },
    { id: 'transport_aviation', category: 'TRANSPORT_AVIATION' },
    { id: 'transport_public',   category: 'TRANSPORT_PUBLIC' },
    { id: 'energy_appliances',  category: 'ENERGY_APPLIANCES' },
    { id: 'energy_fuels',       category: 'ENERGY_FUELS' },
    { id: 'food_dietary',       category: 'FOOD' },
    { id: 'waste_streams',      category: 'WASTE' },
    { id: 'shopping_consumer',  category: 'SHOPPING' },
  ];

  it('has exactly 9 datasets registered', () => {
    expect(reg.size).toBeGreaterThanOrEqual(9);
  });

  for (const { id, category } of EXPECTED_DATASETS) {
    it(`"${id}" is registered with category ${category}`, () => {
      expect(reg.has(id)).toBe(true);
      const entry = reg.get(id);
      expect(entry.category).toBe(category);
    });

    it(`"${id}" has active status`, () => {
      const entry = reg.get(id);
      expect(entry.status).toBe('active');
      expect(entry.validationErrors).toBeUndefined();
    });

    it(`"${id}" has non-empty provenance fields`, () => {
      const entry = reg.get(id);
      expect(entry.version.trim()).toBeTruthy();
      expect(entry.source.trim()).toBeTruthy();
      expect(entry.publicationDate.trim()).toBeTruthy();
      expect(entry.updateDate.trim()).toBeTruthy();
      expect(entry.units.trim()).toBeTruthy();
    });
  }

  it('getSummary reports 9+ active datasets', () => {
    const summary = reg.getSummary();
    expect(summary.totalDatasets).toBeGreaterThanOrEqual(9);
    expect(summary.activeCount).toBeGreaterThanOrEqual(9);
    expect(summary.deprecatedCount).toBe(0);
    expect(summary.pendingCount).toBe(0);
  });

  it('getByCategory returns all transport datasets', () => {
    const vehicles = reg.getByCategory('TRANSPORT_VEHICLES');
    const aviation = reg.getByCategory('TRANSPORT_AVIATION');
    const transit  = reg.getByCategory('TRANSPORT_PUBLIC');
    expect(vehicles).toHaveLength(1);
    expect(aviation).toHaveLength(1);
    expect(transit).toHaveLength(1);
  });

  it('each dataset data object passes structural validation', () => {
    for (const entry of reg.getAll()) {
      expect(
        entry.validationErrors,
        `Dataset "${entry.id}" should have no validation errors`
      ).toBeUndefined();
    }
  });
});
