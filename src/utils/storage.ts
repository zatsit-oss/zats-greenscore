/**
 * Storage utilities with automatic migration from legacy format
 */

import { StorageKeys, CURRENT_STORAGE_VERSION } from '../types/storage';
import type { Project, LegacyProject } from '../types/project';
import { ProjectStatus, APP_VERSION } from '../types/project';
import { EvaluationType, EvaluationStatus } from '../types/evaluation';
import type { Evaluation } from '../types/evaluation';

// Track if migration has already been checked this session
let migrationChecked = false;

/**
 * Safely parse JSON, returning fallback on failure
 */
function safeJsonParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    console.error('Failed to parse JSON from localStorage, using fallback');
    return fallback;
  }
}

/**
 * Safely write to localStorage, handling QuotaExceededError
 */
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Unable to save data.');
    } else {
      console.error('Failed to write to localStorage:', e);
    }
    return false;
  }
}

// ============================================================================
// MIGRATION
// ============================================================================

/**
 * Migrate a legacy project to the new format
 */
function migrateLegacyProject(legacy: LegacyProject): Project {
  const evaluation: Evaluation = {
    type: EvaluationType.API_GREEN_SCORE,
    status:
      legacy.status === ProjectStatus.COMPLETED
        ? EvaluationStatus.COMPLETED
        : EvaluationStatus.IN_PROGRESS,
    answers: legacy.answers || {},
    score: legacy.status === ProjectStatus.COMPLETED ? legacy.score : null,
    ranking: legacy.status === ProjectStatus.COMPLETED ? legacy.ranking : null,
    startedAt: legacy.createdAt,
    completedAt:
      legacy.status === ProjectStatus.COMPLETED ? legacy.updatedAt : undefined
  };

  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.description,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    evaluations: {
      [EvaluationType.API_GREEN_SCORE]: evaluation
    }
  };
}

/**
 * Check if migration is needed and perform it
 */
export function migrateStorageIfNeeded(): void {
  if (migrationChecked) return;

  const version = localStorage.getItem(StorageKeys.STORAGE_VERSION);

  if (version === String(CURRENT_STORAGE_VERSION)) {
    migrationChecked = true;
    return; // Already migrated
  }

  // Check for legacy data
  const legacyInProgress = localStorage.getItem(StorageKeys.LEGACY_IN_PROGRESS);
  const legacyCompleted = localStorage.getItem(StorageKeys.LEGACY_COMPLETED);

  if (!legacyInProgress && !legacyCompleted) {
    // No legacy data, just set version
    safeSetItem(StorageKeys.STORAGE_VERSION, String(CURRENT_STORAGE_VERSION));
    migrationChecked = true;
    return;
  }

  // Migrate legacy data
  const inProgressProjects = safeJsonParse<LegacyProject[]>(legacyInProgress, []);
  const completedProjects = safeJsonParse<LegacyProject[]>(legacyCompleted, []);

  const allLegacyProjects = [...inProgressProjects, ...completedProjects];
  const migratedProjects = allLegacyProjects.map(migrateLegacyProject);

  // Save migrated data
  safeSetItem(StorageKeys.PROJECTS, JSON.stringify(migratedProjects));

  // Clean up legacy keys
  localStorage.removeItem(StorageKeys.LEGACY_IN_PROGRESS);
  localStorage.removeItem(StorageKeys.LEGACY_COMPLETED);

  // Set version
  safeSetItem(StorageKeys.STORAGE_VERSION, String(CURRENT_STORAGE_VERSION));
  migrationChecked = true;

  console.log(
    `Migrated ${migratedProjects.length} projects to new storage format`
  );
}

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  migrateStorageIfNeeded();
  const data = localStorage.getItem(StorageKeys.PROJECTS);
  return safeJsonParse<Project[]>(data, []);
}

/**
 * Get a project by ID
 */
export function getProjectById(id: string): Project | undefined {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id);
}

/**
 * Save a project (create or update)
 * Automatically sets appVersion to current version
 */
export function saveProject(project: Project): void {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  const updated = {
    ...project,
    updatedAt: new Date().toISOString(),
    appVersion: APP_VERSION
  };

  if (index >= 0) {
    projects[index] = updated;
  } else {
    projects.push(updated);
  }

  safeSetItem(StorageKeys.PROJECTS, JSON.stringify(projects));
}

/**
 * Delete a project
 */
export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  safeSetItem(StorageKeys.PROJECTS, JSON.stringify(filtered));
}
