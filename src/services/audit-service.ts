/**
 * Audit Service - Business logic for audit operations
 *
 * Extracts business logic from audit pages (audit.astro, audit-eroom.astro)
 * so that pages only handle DOM interactions.
 *
 * Architecture: Pages (DOM) → audit-service (business) → project-service (storage)
 */

import type { Project } from '../types/project';
import type { Evaluation, EvaluationAnswers } from '../types/evaluation';
import { EvaluationType, EvaluationStatus } from '../types/evaluation';
import type { EroomCategory, EroomAnswerValue } from '../types/eroom';
import { getProject, saveProject } from './project-service';
import type { Question, Answers } from '../types/apigreenscore';
import { calculateProjectScore, getRankingScore } from '../utils/apigreenscore-scoring';
import { calculateEroomGlobalScore, getEroomRanking, validateEroomCompletion } from '../utils/eroom-scoring';

// ============================================================================
// TYPES
// ============================================================================

export interface AuditData {
  project: Project;
  evaluation: Evaluation;
}

export interface FinalizeResult {
  success: boolean;
  score?: number;
  ranking?: string;
  message: string;
}

export interface EroomFinalizeResult extends FinalizeResult {
  isComplete: boolean;
  answeredQuestions: number;
  totalQuestions: number;
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

  return { project, evaluation };
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

/**
 * Finalize an API Green Score evaluation
 * Calculates score, ranking, marks as COMPLETED
 */
export function finalizeApiGreenScoreEvaluation(
  projectId: string,
  answers: Answers,
  questions: Question[]
): FinalizeResult {
  const project = getProject(projectId);
  if (!project) {
    return { success: false, message: 'Project not found. Cannot save.' };
  }

  const evaluation = project.evaluations[EvaluationType.API_GREEN_SCORE];
  if (!evaluation) {
    return { success: false, message: 'Evaluation not found. Cannot save.' };
  }

  const { avg: finalScore } = calculateProjectScore(answers, questions);
  const finalRanking = getRankingScore(answers, questions);

  evaluation.answers = answers;
  evaluation.score = finalScore;
  evaluation.ranking = finalRanking;
  evaluation.status = EvaluationStatus.COMPLETED;
  evaluation.completedAt = new Date().toISOString();

  saveProject(project);

  return {
    success: true,
    score: finalScore,
    ranking: finalRanking,
    message: `Audit Completed! Score: ${finalScore}/100`
  };
}

/**
 * Finalize an EROOM evaluation
 * Validates completion, calculates score, marks COMPLETED or IN_PROGRESS
 */
export function finalizeEroomEvaluation(
  projectId: string,
  answers: Record<string, EroomAnswerValue>,
  allCategories: EroomCategory[],
  scoredCategories: EroomCategory[]
): EroomFinalizeResult {
  const project = getProject(projectId);
  if (!project) {
    return {
      success: false,
      isComplete: false,
      answeredQuestions: 0,
      totalQuestions: 0,
      message: 'Project not found. Cannot save.'
    };
  }

  const evaluation = project.evaluations[EvaluationType.EROOM];
  if (!evaluation) {
    return {
      success: false,
      isComplete: false,
      answeredQuestions: 0,
      totalQuestions: 0,
      message: 'Evaluation not found. Cannot save.'
    };
  }

  const validation = validateEroomCompletion(answers, scoredCategories);
  const { globalScore } = calculateEroomGlobalScore(answers, allCategories);
  const ranking = getEroomRanking(globalScore);

  evaluation.answers = answers as EvaluationAnswers;
  evaluation.score = globalScore;
  evaluation.ranking = ranking;
  evaluation.answeredQuestions = validation.answeredQuestions;
  evaluation.totalQuestions = validation.totalQuestions;

  if (validation.isComplete) {
    evaluation.status = EvaluationStatus.COMPLETED;
    evaluation.completedAt = new Date().toISOString();
  } else {
    evaluation.status = EvaluationStatus.IN_PROGRESS;
  }

  saveProject(project);

  let message: string;
  if (validation.isComplete) {
    if (globalScore <= 25) {
      message = `Very mature service! Score: ${globalScore}%`;
    } else if (globalScore <= 50) {
      message = `Some optimizations possible. Score: ${globalScore}%`;
    } else if (globalScore <= 75) {
      message = `Significant optimization potential. Score: ${globalScore}%`;
    } else {
      message = `High optimization potential! Score: ${globalScore}%`;
    }
  } else {
    const remaining = validation.totalQuestions - validation.answeredQuestions;
    message = `Progress saved. ${remaining} question${remaining > 1 ? 's' : ''} remaining to complete the evaluation.`;
  }

  return {
    success: true,
    score: globalScore,
    ranking,
    isComplete: validation.isComplete,
    answeredQuestions: validation.answeredQuestions,
    totalQuestions: validation.totalQuestions,
    message
  };
}

/**
 * Save EROOM progress with progressive score calculation
 * Used by auto-save on input change for EROOM
 */
export function saveEroomProgressiveScore(
  projectId: string,
  evalType: EvaluationType,
  answers: Record<string, EroomAnswerValue>,
  allCategories: EroomCategory[],
  scoredCategories: EroomCategory[]
): boolean {
  const project = getProject(projectId);
  if (!project) return false;

  const evaluation = project.evaluations[evalType];
  if (!evaluation) return false;

  evaluation.answers = answers as EvaluationAnswers;

  const { globalScore } = calculateEroomGlobalScore(answers, allCategories);
  evaluation.score = globalScore;
  evaluation.ranking = getEroomRanking(globalScore);

  const scoredValidation = validateEroomCompletion(answers, scoredCategories);
  evaluation.answeredQuestions = scoredValidation.answeredQuestions;
  evaluation.totalQuestions = scoredValidation.totalQuestions;

  project.updatedAt = new Date().toISOString();
  saveProject(project);
  return true;
}
