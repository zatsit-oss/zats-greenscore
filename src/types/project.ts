/**
 * Types for project management with multi-evaluation support
 */

import type { Evaluation } from './evaluation';
import { EvaluationType, EvaluationStatus } from './evaluation';
import { ProjectRanking } from './common';

// Re-export for backward compatibility
export { ProjectRanking } from './common';

// ============================================================================
// PROJECT INTERFACE
// ============================================================================

/**
 * Current application version (from package.json)
 * Used to track which version created/modified a project
 */
export const APP_VERSION = '0.0.1';

/**
 * Project with support for multiple evaluation types
 * Each project can have one evaluation of each type
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  evaluations: Partial<Record<EvaluationType, Evaluation>>;
  /**
   * Application version that last modified this project (semver)
   * - undefined/missing: legacy project (pre-0.0.1)
   * - "0.0.1": current version
   */
  appVersion?: string;
}

// ============================================================================
// LEGACY TYPES (for migration)
// ============================================================================

export enum ProjectStatus {
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed'
}

export interface AuditAnswers {
  [questionId: string]: boolean | string | number;
}

export interface LegacyProjectInProgress {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus.IN_PROGRESS;
  score: null;
  ranking?: null;
  answers?: AuditAnswers;
}

export interface LegacyProjectCompleted {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus.COMPLETED;
  score: number;
  ranking: ProjectRanking;
  answers: AuditAnswers;
}

export type LegacyProject = LegacyProjectInProgress | LegacyProjectCompleted;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if project has any completed evaluation
 */
export function hasCompletedEvaluation(project: Project): boolean {
  return Object.values(project.evaluations).some(
    (evaluation) => evaluation?.status === EvaluationStatus.COMPLETED
  );
}

/**
 * Check if project has a specific evaluation type
 */
export function hasEvaluationType(project: Project, type: EvaluationType): boolean {
  return project.evaluations[type] !== undefined;
}

/**
 * Get the best score from all evaluations (for display on cards)
 */
export function getBestScore(project: Project): number | null {
  const completedEvaluations = Object.values(project.evaluations).filter(
    (evaluation) => evaluation?.status === EvaluationStatus.COMPLETED && evaluation.score !== null
  );

  if (completedEvaluations.length === 0) return null;

  return Math.max(...completedEvaluations.map((e) => e!.score!));
}

/**
 * Get the best ranking from all evaluations
 */
export function getBestRanking(project: Project): ProjectRanking | null {
  const completedEvaluations = Object.values(project.evaluations).filter(
    (evaluation) => evaluation?.status === EvaluationStatus.COMPLETED && evaluation.ranking !== null
  );

  if (completedEvaluations.length === 0) return null;

  const rankingOrder: ProjectRanking[] = [
    ProjectRanking.A,
    ProjectRanking.B,
    ProjectRanking.C,
    ProjectRanking.D,
    ProjectRanking.E
  ];

  const rankings = completedEvaluations.map((e) => e!.ranking!);
  return rankings.sort((a, b) => rankingOrder.indexOf(a) - rankingOrder.indexOf(b))[0];
}

/**
 * Create a new project
 */
export function createProject(name: string, description: string): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
    evaluations: {},
    appVersion: APP_VERSION
  };
}
