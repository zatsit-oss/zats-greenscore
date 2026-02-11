/**
 * Project Service - Business operations on projects
 *
 * This service abstracts project operations for UI components.
 * Currently uses localStorage via storage adapter, designed for easy migration to API.
 *
 * Architecture note: This is a "port" in hexagonal architecture terms.
 * The storage adapter can be swapped for an API adapter later.
 */

import type { Project } from '../types/project';
import type { Evaluation } from '../types/evaluation';
import {
  getAllProjects as storageGetAllProjects,
  getProjectById as storageGetProjectById,
  saveProject as storageSaveProject,
  deleteProject as storageDeleteProject,
  migrateStorageIfNeeded as storageMigrateIfNeeded
} from '../utils/storage';

// ============================================================================
// PROJECT OPERATIONS
// ============================================================================

/**
 * Ensure storage is migrated (call on app init)
 */
export function ensureStorageMigrated(): void {
  storageMigrateIfNeeded();
}

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  return storageGetAllProjects();
}

/**
 * Get a project by ID
 */
export function getProject(id: string): Project | undefined {
  return storageGetProjectById(id);
}

/**
 * Save a project (create or update)
 */
export function saveProject(project: Project): void {
  storageSaveProject(project);
}

/**
 * Delete a project by ID
 * @returns true if deletion was successful
 */
export function deleteProject(id: string): boolean {
  const project = storageGetProjectById(id);
  if (!project) {
    return false;
  }
  storageDeleteProject(id);
  return true;
}

/**
 * Update an evaluation within a project
 */
export function updateProjectEvaluation(
  projectId: string,
  evaluation: Evaluation
): boolean {
  const project = storageGetProjectById(projectId);
  if (!project) {
    return false;
  }

  project.evaluations[evaluation.type] = evaluation;
  storageSaveProject(project);
  return true;
}
