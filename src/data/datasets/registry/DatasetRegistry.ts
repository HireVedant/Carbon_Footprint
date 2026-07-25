/**
 * EcoTrack AI — Central Dataset Registry (Phase 7A)
 *
 * Architecture:
 *   Every scientific dataset self-registers with the Registry on import.
 *   The Registry is the single authoritative source for dataset metadata,
 *   versioning, validation status, and rollback support.
 *
 * Key Principles:
 *   - Singleton: one registry instance per application lifetime
 *   - Additive: existing datasets continue to work without modification to their core logic
 *   - Versioned: every dataset entry carries full provenance metadata
 *   - Rollback-safe: previous dataset versions are retained in registry memory
 *   - Validated: datasets must pass structural validation before being marked active
 */

// ─── Dataset Status ──────────────────────────────────────────────────────────

export type DatasetStatus =
  | 'active'            // Currently used by calculation engine
  | 'deprecated'        // Superseded by a newer version; kept for audit
  | 'pending_validation' // Imported but not yet validated
  | 'rollback';         // Manually rolled back by admin; previous version restored

// ─── Registered Dataset Interface ────────────────────────────────────────────

export interface RegisteredDataset<T = unknown> {
  /** Unique stable identifier for this dataset type (e.g. 'electricity_grid') */
  id: string;

  /** Human-readable display name */
  displayName: string;

  /** Dataset version string (e.g. 'CEA-2026.1') */
  version: string;

  /** Authoritative source organization / publication */
  source: string;

  /** ISO date of original publication */
  publicationDate: string;

  /** ISO date of last data update */
  updateDate: string;

  /** Physical measurement unit (e.g. 'kg CO2e / kWh') */
  units: string;

  /** Data domain category */
  category:
    | 'ELECTRICITY'
    | 'TRANSPORT_VEHICLES'
    | 'TRANSPORT_AVIATION'
    | 'TRANSPORT_PUBLIC'
    | 'ENERGY_APPLIANCES'
    | 'ENERGY_FUELS'
    | 'FOOD'
    | 'WASTE'
    | 'SHOPPING'
    | 'LOCATIONS';

  /** Current lifecycle status */
  status: DatasetStatus;

  /** Timestamp when this version was registered (ISO string) */
  registeredAt: string;

  /** Optional human-readable description */
  description?: string;

  /** Known assumptions or caveats about this dataset */
  assumptions?: string[];

  /** Optional SPDX license identifier (e.g. 'CC-BY-4.0', 'Public Domain') */
  license?: string;

  /** Optional simple checksum for integrity verification (SHA-256 prefix) */
  checksum?: string;

  /** Previous version entry for rollback support (one level) */
  previousVersion?: Omit<RegisteredDataset<T>, 'previousVersion'>;

  /** The actual dataset data object */
  data: T;

  /** Validation errors (populated by validate()) */
  validationErrors?: string[];
}

// ─── Validation Rules ─────────────────────────────────────────────────────────

const REQUIRED_DATASET_FIELDS = [
  'datasetVersion', 'source', 'publicationDate', 'updateDate'
] as const;

/**
 * Validates a raw dataset object for required provenance fields.
 * Returns an array of error strings (empty = valid).
 */
export function validateDatasetObject(datasetObj: unknown): string[] {
  const errors: string[] = [];
  if (!datasetObj || typeof datasetObj !== 'object') {
    return ['Dataset object must be a non-null object'];
  }
  const obj = datasetObj as Record<string, unknown>;
  for (const field of REQUIRED_DATASET_FIELDS) {
    if (!obj[field] || typeof obj[field] !== 'string' || !(obj[field] as string).trim()) {
      errors.push(`Missing or empty required field: "${field}"`);
    }
  }
  return errors;
}

// ─── Dataset Registry Singleton ───────────────────────────────────────────────

export class DatasetRegistry {
  private static instance: DatasetRegistry | null = null;
  private registry = new Map<string, RegisteredDataset<unknown>>();

  private constructor() {}

  /** Returns the singleton registry instance */
  static getInstance(): DatasetRegistry {
    if (!DatasetRegistry.instance) {
      DatasetRegistry.instance = new DatasetRegistry();
    }
    return DatasetRegistry.instance;
  }

  /**
   * Resets the singleton (only for use in tests — never in production code).
   * @internal
   */
  static _resetForTests(): void {
    DatasetRegistry.instance = null;
  }

  /**
   * Registers a dataset with the registry.
   * If a dataset with the same id already exists, the current one becomes
   * `previousVersion` and the new one takes the active slot.
   */
  register<T>(entry: Omit<RegisteredDataset<T>, 'registeredAt' | 'validationErrors'>): void {
    const errors = validateDatasetObject(entry.data);

    const registered: RegisteredDataset<T> = {
      ...entry,
      registeredAt: new Date().toISOString(),
      status: errors.length > 0 ? 'pending_validation' : (entry.status ?? 'active'),
      validationErrors: errors.length > 0 ? errors : undefined,
    };

    // Preserve previous version for rollback
    const existing = this.registry.get(entry.id);
    if (existing) {
      (registered as any).previousVersion = { ...existing, previousVersion: undefined };
    }

    this.registry.set(entry.id, registered as RegisteredDataset<unknown>);
  }

  /**
   * Retrieves a registered dataset by id.
   * Throws if the dataset is not registered.
   */
  get<T>(id: string): RegisteredDataset<T> {
    const entry = this.registry.get(id);
    if (!entry) {
      throw new Error(
        `[DatasetRegistry] Dataset "${id}" is not registered. ` +
        `Make sure the dataset file is imported before accessing the registry.`
      );
    }
    return entry as RegisteredDataset<T>;
  }

  /**
   * Returns all registered datasets as an array.
   */
  getAll(): RegisteredDataset<unknown>[] {
    return Array.from(this.registry.values());
  }

  /**
   * Returns datasets filtered by category.
   */
  getByCategory(category: RegisteredDataset['category']): RegisteredDataset<unknown>[] {
    return this.getAll().filter(d => d.category === category);
  }

  /**
   * Returns true if a dataset with the given id is registered.
   */
  has(id: string): boolean {
    return this.registry.has(id);
  }

  /**
   * Returns the total number of registered datasets.
   */
  get size(): number {
    return this.registry.size;
  }

  /**
   * Marks a dataset as deprecated (admin action).
   * Does not remove it — deprecated datasets remain for audit.
   */
  deprecate(id: string): void {
    const entry = this.registry.get(id);
    if (!entry) throw new Error(`[DatasetRegistry] Cannot deprecate unknown dataset: "${id}"`);
    this.registry.set(id, { ...entry, status: 'deprecated' });
  }

  /**
   * Rolls back a dataset to its previous version (admin action).
   * The current version is replaced with `previousVersion` data.
   * Returns false if no previous version exists.
   */
  rollback(id: string): boolean {
    const entry = this.registry.get(id);
    if (!entry || !entry.previousVersion) return false;

    const restored: RegisteredDataset<unknown> = {
      ...(entry.previousVersion as RegisteredDataset<unknown>),
      status: 'rollback',
      registeredAt: new Date().toISOString(),
    };
    this.registry.set(id, restored);
    return true;
  }

  /**
   * Re-validates a dataset and updates its status accordingly.
   * Returns true if validation passed.
   */
  validate(id: string): boolean {
    const entry = this.registry.get(id);
    if (!entry) throw new Error(`[DatasetRegistry] Cannot validate unknown dataset: "${id}"`);

    const errors = validateDatasetObject(entry.data);
    const updated: RegisteredDataset<unknown> = {
      ...entry,
      validationErrors: errors.length > 0 ? errors : undefined,
      status: errors.length > 0 ? 'pending_validation' : 'active',
    };
    this.registry.set(id, updated);
    return errors.length === 0;
  }

  /**
   * Returns a summary object suitable for Admin Dashboard display.
   */
  getSummary(): {
    totalDatasets: number;
    activeCount: number;
    deprecatedCount: number;
    pendingCount: number;
    datasets: {
      id: string;
      displayName: string;
      version: string;
      source: string;
      status: DatasetStatus;
      category: string;
      updateDate: string;
      hasValidationErrors: boolean;
    }[];
  } {
    const all = this.getAll();
    return {
      totalDatasets: all.length,
      activeCount: all.filter(d => d.status === 'active').length,
      deprecatedCount: all.filter(d => d.status === 'deprecated').length,
      pendingCount: all.filter(d => d.status === 'pending_validation').length,
      datasets: all.map(d => ({
        id: d.id,
        displayName: d.displayName,
        version: d.version,
        source: d.source,
        status: d.status,
        category: d.category,
        updateDate: d.updateDate,
        hasValidationErrors: !!(d.validationErrors && d.validationErrors.length > 0),
      })),
    };
  }
}

// ─── Convenience accessor (import this in other files) ────────────────────────

/** The global DatasetRegistry singleton */
export const registry = DatasetRegistry.getInstance();
