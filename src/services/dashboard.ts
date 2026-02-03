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
 * Get dashboard statistics for a specific evaluation type
 */
export function getDashboardStats(evalType: EvaluationType): DashboardStats {
  const projects = getProjectsWithEvaluation(evalType);

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
        isCompleted: evaluation.status === EvaluationStatus.COMPLETED
      };
    });
}

/**
 * Get chart data for completed projects of a specific evaluation type
 */
export function getChartData(evalType: EvaluationType): ChartDataPoint[] {
  const projects = getProjectsWithEvaluation(evalType);

  return projects
    .filter((p) => p.isCompleted && p.evaluation.score !== null)
    .map((p) => ({
      label: p.project.name,
      value: p.evaluation.score!,
      id: p.project.id
    }));
}
