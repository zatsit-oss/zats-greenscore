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
  avgScore: number;
}

export interface ProjectWithEvaluation {
  project: Project;
  evaluation: Evaluation;
  evaluationType: EvaluationType;
  isCompleted: boolean;
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
 */
export function getDashboardStats(evalType: EvaluationType | null): DashboardStats {
  const projects = evalType
    ? getProjectsWithEvaluation(evalType)
    : getAllProjectsWithAnyEvaluation();

  const completedProjects = projects.filter((p) => p.isCompleted);

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
    avgScore
  };
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
        isCompleted: evaluation.status === EvaluationStatus.COMPLETED
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
        isCompleted: evaluation.status === EvaluationStatus.COMPLETED
      };
    });
}

/**
 * Get chart data for completed projects of a specific evaluation type (or all types if null)
 */
export function getChartData(evalType: EvaluationType | null): ChartDataPoint[] {
  const projects = evalType
    ? getProjectsWithEvaluation(evalType)
    : getAllProjectsWithAnyEvaluation();

  return projects
    .filter((p) => p.isCompleted && p.evaluation.score !== null)
    .map((p) => ({
      label: p.project.name,
      value: p.evaluation.score!,
      id: p.project.id
    }));
}
