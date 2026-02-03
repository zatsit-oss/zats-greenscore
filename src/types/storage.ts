// ============================================================================
// STORAGE KEYS
// ============================================================================

export enum StorageKeys {
  // New unified storage
  PROJECTS = 'projects',
  STORAGE_VERSION = 'storageVersion',

  // Legacy keys (for migration)
  LEGACY_IN_PROGRESS = 'inProgress',
  LEGACY_COMPLETED = 'Completed'
}

export const CURRENT_STORAGE_VERSION = 2;
