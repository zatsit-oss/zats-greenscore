/**
 * Evaluation Service - Score calculation, interpretation and chart data
 *
 * Handles all scoring operations: finalization, progressive scoring,
 * score interpretation, and chart data preparation.
 *
 * Architecture: Pages (DOM) → evaluation-service (scoring) → project-service (storage)
 *                                                           → scoring utils (calculation)
 */

import {EvaluationStatus, EvaluationType} from '../types/evaluation';
import type {EvaluationAnswers} from '../types/evaluation';
import type {Answers, Question} from '../types/apigreenscore';
import type {EroomAnswerValue, EroomCategory} from '../types/eroom';
import {getProject, saveProject} from './project-service';
import {calculateProjectScore, getRankingScore, calculateScoresBySection} from '../utils/apigreenscore-scoring';
import {calculateEroomGlobalScore, getEroomRanking, getScoreInterpretation, validateEroomCompletion} from '../utils/eroom-scoring';

// ============================================================================
// TYPES
// ============================================================================

export interface ScoreDetails {
    text: string;
    color: string;
    shadow: string;
}

export interface ChartDataPoint {
    label: string;
    score: number;
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
// SCORE FINALIZATION
// ============================================================================

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
        return {success: false, message: 'Project not found. Cannot save.'};
    }

    const evaluation = project.evaluations[EvaluationType.API_GREEN_SCORE];
    if (!evaluation) {
        return {success: false, message: 'Evaluation not found. Cannot save.'};
    }

    const {avg: finalScore} = calculateProjectScore(answers, questions);
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
    const {globalScore} = calculateEroomGlobalScore(answers, allCategories);
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

    const {globalScore} = calculateEroomGlobalScore(answers, allCategories);
    evaluation.score = globalScore;
    evaluation.ranking = getEroomRanking(globalScore);

    const scoredValidation = validateEroomCompletion(answers, scoredCategories);
    evaluation.answeredQuestions = scoredValidation.answeredQuestions;
    evaluation.totalQuestions = scoredValidation.totalQuestions;

    project.updatedAt = new Date().toISOString();
    saveProject(project);
    return true;
}

// ============================================================================
// SCORE INTERPRETATION
// ============================================================================

/**
 * Get score interpretation for API Green Score (high = good)
 */
export function getApiGreenScoreDetails(score: number): ScoreDetails {
    if (score >= 90) return {text: 'Excellent', color: '#10b981', shadow: 'rgba(16, 185, 129, 0.2)'};
    if (score >= 75) return {text: 'Good', color: '#84cc16', shadow: 'rgba(132, 204, 22, 0.2)'};
    if (score >= 50) return {text: 'Needs Improvement', color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.2)'};
    return {text: 'Poor', color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.2)'};
}

/**
 * Get score interpretation for EROOM (high = more optimization potential)
 */
export function getEroomScoreDetails(score: number): ScoreDetails {
    const interpretation = getScoreInterpretation(score);
    return {
        text: interpretation.level,
        color: interpretation.color,
        shadow: `${interpretation.color}33`
    };
}

/**
 * Get score details by evaluation type
 */
export function getScoreDetailsByType(score: number, evalType: EvaluationType): ScoreDetails {
    if (evalType === EvaluationType.EROOM) {
        return getEroomScoreDetails(score);
    }
    return getApiGreenScoreDetails(score);
}

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare radar chart data for API Green Score (section-based)
 */
export function prepareApiGreenScoreChartData(
    answers: Answers,
    questions: Question[]
): ChartDataPoint[] {
    const sectionScores = calculateScoresBySection(answers, questions);
    return sectionScores.map(s => ({label: s.section, score: s.score}));
}

/**
 * Prepare radar chart data for EROOM (category-based)
 */
export function prepareEroomChartData(
    answers: Record<string, EroomAnswerValue>,
    categories: EroomCategory[]
): ChartDataPoint[] {
    const {categoryScores} = calculateEroomGlobalScore(answers, categories);
    return categoryScores.map(cs => ({label: cs.categoryName, score: cs.score}));
}

/**
 * Prepare radar chart data for any evaluation type
 */
export function prepareChartData(
    answers: Record<string, boolean | string | number>,
    evalType: EvaluationType,
    questions?: Question[],
    categories?: EroomCategory[]
): ChartDataPoint[] {
    if (evalType === EvaluationType.EROOM && categories) {
        return prepareEroomChartData(
            answers as Record<string, EroomAnswerValue>,
            categories
        );
    }
    if (questions) {
        return prepareApiGreenScoreChartData(answers, questions);
    }
    return [];
}
