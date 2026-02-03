/**
 * Storage utilities with automatic migration from legacy format
 */

import { StorageKeys, CURRENT_STORAGE_VERSION } from '../types/storage';
import type { Project, LegacyProject } from '../types/project';
import type { Evaluation } from '../types/evaluation';
import { ProjectRanking, ProjectStatus, APP_VERSION } from '../types/project';
import { EvaluationType, EvaluationStatus } from '../types/evaluation';

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
  const version = localStorage.getItem(StorageKeys.STORAGE_VERSION);

  if (version === String(CURRENT_STORAGE_VERSION)) {
    return; // Already migrated
  }

  // Check for legacy data
  const legacyInProgress = localStorage.getItem(StorageKeys.LEGACY_IN_PROGRESS);
  const legacyCompleted = localStorage.getItem(StorageKeys.LEGACY_COMPLETED);

  if (!legacyInProgress && !legacyCompleted) {
    // No legacy data, just set version
    localStorage.setItem(
      StorageKeys.STORAGE_VERSION,
      String(CURRENT_STORAGE_VERSION)
    );
    return;
  }

  // Migrate legacy data
  const inProgressProjects: LegacyProject[] = legacyInProgress
    ? JSON.parse(legacyInProgress)
    : [];
  const completedProjects: LegacyProject[] = legacyCompleted
    ? JSON.parse(legacyCompleted)
    : [];

  const allLegacyProjects = [...inProgressProjects, ...completedProjects];
  const migratedProjects = allLegacyProjects.map(migrateLegacyProject);

  // Save migrated data
  localStorage.setItem(StorageKeys.PROJECTS, JSON.stringify(migratedProjects));

  // Clean up legacy keys
  localStorage.removeItem(StorageKeys.LEGACY_IN_PROGRESS);
  localStorage.removeItem(StorageKeys.LEGACY_COMPLETED);

  // Set version
  localStorage.setItem(
    StorageKeys.STORAGE_VERSION,
    String(CURRENT_STORAGE_VERSION)
  );

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
  return data ? JSON.parse(data) : [];
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

  project.updatedAt = new Date().toISOString();
  project.appVersion = APP_VERSION;

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  localStorage.setItem(StorageKeys.PROJECTS, JSON.stringify(projects));
}

/**
 * Delete a project
 */
export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(StorageKeys.PROJECTS, JSON.stringify(filtered));
}

/**
 * Get projects with completed evaluations (for dashboard stats)
 */
export function getCompletedProjects(): Project[] {
  const projects = getAllProjects();
  return projects.filter((p) =>
    Object.values(p.evaluations).some(
      (e) => e?.status === EvaluationStatus.COMPLETED
    )
  );
}

/**
 * Update an evaluation within a project
 */
export function updateProjectEvaluation(
  projectId: string,
  evaluation: Evaluation
): void {
  const project = getProjectById(projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  project.evaluations[evaluation.type] = evaluation;
  saveProject(project);
}
