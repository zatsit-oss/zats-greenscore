/**
 * Dashboard Service - Data layer for dashboard statistics
 *
 * This service abstracts data access for the dashboard.
 * Currently uses localStorage, but designed for easy migration to API calls.
 *
 * Architecture note: This is a "port" in hexagonal architecture terms.
 * The implementation (localStorage) can be swapped for an API adapter later.
 *
 * TODO: Create a similar service for Project View page
 * - getProjectEvaluations(projectId) - Get all evaluations for a project
 * - getProjectEvaluationTypes(projectId) - Get available types for selector
 * - addEvaluationToProject(projectId, evalType) - Add new evaluation type
 */

import type { Project } from '../types/project';
import type { Evaluation } from '../types/evaluation';
import { EvaluationType, EvaluationStatus } from '../types/evaluation';
import { getAllProjects } from '../utils/storage';

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardStats {
  totalProjects: number;
  completedProjects: number;
  avgScore: number | null;
  isAverageScoreMeaningful: boolean;
}

export interface EvaluationSummary {
  type: EvaluationType;
  score: number | null;
  isCompleted: boolean;
}

export interface ProjectWithEvaluation {
  project: Project;
  evaluation: Evaluation;
  evaluationType: EvaluationType;
  isCompleted: boolean;
  // All evaluations for this project (for multi-score display)
  allEvaluations: EvaluationSummary[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  id: string;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Get dashboard statistics for a specific evaluation type (or all types if null)
 *
 * When evalType is null (all evaluations), avgScore is null and isAverageScoreMeaningful is false
 * because mixing different evaluation types (with different scales) produces meaningless averages.
 */
export function getDashboardStats(evalType: EvaluationType | null): DashboardStats {
  const projects = evalType
    ? getProjectsWithEvaluation(evalType)
    : getAllProjectsWithAnyEvaluation();

  const completedProjects = projects.filter((p) => p.isCompleted);

  // When "All evaluations" is selected, average score is meaningless
  // because different evaluation types have different scales
  if (evalType === null) {
    return {
      totalProjects: projects.length,
      completedProjects: completedProjects.length,
      avgScore: null,
      isAverageScoreMeaningful: false
    };
  }

  const avgScore =
    completedProjects.length > 0
      ? Math.round(
          completedProjects.reduce((acc, p) => acc + (p.evaluation.score || 0), 0) /
            completedProjects.length
        )
      : 0;

  return {
    totalProjects: projects.length,
    completedProjects: completedProjects.length,
    avgScore,
    isAverageScoreMeaningful: true
  };
}

/**
 * Build allEvaluations summary for a project
 */
function buildEvaluationsSummary(project: Project): EvaluationSummary[] {
  return (Object.entries(project.evaluations) as [EvaluationType, Evaluation][])
    .map(([type, evaluation]) => ({
      type,
      score: evaluation.score,
      isCompleted: evaluation.status === EvaluationStatus.COMPLETED
    }));
}

/**
 * Get projects that have a specific evaluation type
 */
export function getProjectsWithEvaluation(evalType: EvaluationType): ProjectWithEvaluation[] {
  const allProjects = getAllProjects();

  return allProjects
    .filter((project) => project.evaluations[evalType] !== undefined)
    .map((project) => {
      const evaluation = project.evaluations[evalType]!;
      return {
        project,
        evaluation,
        evaluationType: evalType,
        isCompleted: evaluation.status === EvaluationStatus.COMPLETED,
        allEvaluations: buildEvaluationsSummary(project)
      };
    });
}

/**
 * Get all projects with any evaluation (for "All evaluations" filter)
 * Returns one entry per project, using the first available evaluation
 */
export function getAllProjectsWithAnyEvaluation(): ProjectWithEvaluation[] {
  const allProjects = getAllProjects();

  return allProjects
    .filter((project) => Object.keys(project.evaluations).length > 0)
    .map((project) => {
      // Get the first evaluation type available
      const evalTypes = Object.keys(project.evaluations) as EvaluationType[];
      const evalType = evalTypes[0];
      const evaluation = project.evaluations[evalType]!;
      return {
        project,
        evaluation,
        evaluationType: evalType,
        isCompleted: evaluation.status === EvaluationStatus.COMPLETED,
        allEvaluations: buildEvaluationsSummary(project)
      };
    });
}

/**
 * Get chart data for completed projects of a specific evaluation type
 *
 * Returns empty array when evalType is null (all evaluations) because
 * mixing different evaluation types on the same chart is misleading.
 */
export function getChartData(evalType: EvaluationType | null): ChartDataPoint[] {
  // Don't show chart when "All evaluations" is selected
  // because different evaluation types have different scales
  if (evalType === null) {
    return [];
  }

  const projects = getProjectsWithEvaluation(evalType);

  return projects
    .filter((p) => p.isCompleted && p.evaluation.score !== null)
    .map((p) => ({
      label: p.project.name,
      value: p.evaluation.score!,
      id: p.project.id
    }));
}
