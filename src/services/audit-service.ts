/**
 * Audit Service - Persistence for audit operations
 *
 * Handles loading and saving audit progress (answers only).
 * Score calculation and finalization are handled by evaluation-service.
 *
 * Architecture: Pages (DOM) → audit-service (persistence) → project-service (storage)
 */

import type {Project} from '../types/project';
import type {Evaluation} from '../types/evaluation';
import {EvaluationType} from '../types/evaluation';
import {getProject, saveProject} from './project-service';

// ============================================================================
// TYPES
// ============================================================================

export interface AuditData {
    project: Project;
    evaluation: Evaluation;
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Load project and evaluation data for an audit
 * Returns null if project or evaluation not found
 */
export function loadAuditData(
    projectId: string,
    evalType: EvaluationType
): AuditData | null {
    const project = getProject(projectId);
    if (!project) return null;

    const evaluation = project.evaluations[evalType];
    if (!evaluation) return null;

    return {project, evaluation};
}

/**
 * Save audit progress (answers only, no finalization)
 * Used by auto-save on input change for API Green Score
 */
export function saveAuditProgress(
    projectId: string,
    evalType: EvaluationType,
    answers: Record<string, boolean | string | number>,
    progressInfo?: { answeredQuestions: number; totalQuestions: number }
): boolean {
    const project = getProject(projectId);
    if (!project) return false;

    const evaluation = project.evaluations[evalType];
    if (!evaluation) return false;

    evaluation.answers = answers;
    if (progressInfo) {
        evaluation.answeredQuestions = progressInfo.answeredQuestions;
        evaluation.totalQuestions = progressInfo.totalQuestions;
    }
    project.updatedAt = new Date().toISOString();
    saveProject(project);
    return true;
}
