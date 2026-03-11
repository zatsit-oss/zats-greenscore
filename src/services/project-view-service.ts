/**
 * Project View Service - Data aggregation for the project detail page
 *
 * Centralizes business logic used by projects/view.astro:
 * evaluation selection, display data preparation, and evaluation lifecycle.
 *
 * Architecture: Pages (DOM) → project-view-service (aggregation) → project-service / evaluation-service
 */

import type {Project} from '../types/project';
import type {Evaluation} from '../types/evaluation';
import {EvaluationType, EvaluationStatus, EVALUATION_TYPES, createEmptyEvaluation} from '../types/evaluation';
import type {Question} from '../types/apigreenscore';
import type {EroomCategory} from '../types/eroom';
import {getProject, saveProject} from './project-service';
import {getScoreDetailsByType, prepareChartData} from './evaluation-service';
import type {ScoreDetails, ChartDataPoint} from './evaluation-service';
import {getScoreInterpretation} from '../utils/eroom-scoring';

// ============================================================================
// TYPES
// ============================================================================

export interface EvaluationDisplayData {
    evaluation: Evaluation | undefined;
    isCompleted: boolean;
    status: 'Completed' | 'In Progress' | 'Not Started';
    scoreTitle: string;
    score: number | null;
    scoreDetails: ScoreDetails | null;
    scoreContext: string | null;
    chartData: ChartDataPoint[];
    progress: { answered: number; total: number } | null;
    auditPageUrl: string;
    editButtonText: string;
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Determine the initial evaluation type to display for a project
 */
export function getInitialEvaluationType(
    project: Project,
    requestedEvalType: EvaluationType | null
): EvaluationType {
    if (requestedEvalType && project.evaluations[requestedEvalType]) {
        return requestedEvalType;
    }
    const projectEvalTypes = Object.keys(project.evaluations) as EvaluationType[];
    return projectEvalTypes[0] || EvaluationType.API_GREEN_SCORE;
}

/**
 * Get the audit page URL for a given evaluation type
 */
export function getAuditPageUrl(evalType: EvaluationType, projectId: string): string {
    const page = evalType === EvaluationType.EROOM ? '/audit-eroom' : '/audit-apigreenscore';
    return `${page}?projectId=${projectId}`;
}

/**
 * Get all display data for a project's evaluation
 * Aggregates score details, chart data, status, and context in one call
 */
export function getEvaluationDisplayData(
    project: Project,
    evalType: EvaluationType,
    questions?: Question[],
    eroomCategories?: EroomCategory[]
): EvaluationDisplayData {
    const evaluation = project.evaluations[evalType];
    const evalMeta = EVALUATION_TYPES[evalType];
    const score = evaluation?.score ?? null;

    // Status
    let status: EvaluationDisplayData['status'] = 'Not Started';
    let isCompleted = false;
    if (evaluation) {
        isCompleted = evaluation.status === EvaluationStatus.COMPLETED;
        status = isCompleted ? 'Completed' : 'In Progress';
    }

    // Score details
    const scoreDetails = score !== null ? getScoreDetailsByType(score, evalType) : null;

    // Score context (EROOM-specific interpretation)
    let scoreContext: string | null = null;
    if (evalType === EvaluationType.EROOM && score !== null) {
        scoreContext = getScoreInterpretation(score).description;
    }

    // Chart data
    let chartData: ChartDataPoint[] = [];
    if (evaluation?.answers && Object.keys(evaluation.answers).length > 0) {
        chartData = prepareChartData(
            evaluation.answers,
            evalType,
            evalType === EvaluationType.API_GREEN_SCORE ? questions : undefined,
            evalType === EvaluationType.EROOM ? eroomCategories : undefined
        );
    }

    // Progress
    let progress: { answered: number; total: number } | null = null;
    if (evaluation && evaluation.answeredQuestions !== undefined
        && evaluation.totalQuestions !== undefined
        && evaluation.status !== EvaluationStatus.COMPLETED) {
        progress = {
            answered: evaluation.answeredQuestions,
            total: evaluation.totalQuestions
        };
    }

    return {
        evaluation,
        isCompleted,
        status,
        scoreTitle: `Current ${evalMeta?.shortName || evalMeta?.name || 'Score'}`,
        score,
        scoreDetails,
        scoreContext,
        chartData,
        progress,
        auditPageUrl: getAuditPageUrl(evalType, project.id),
        editButtonText: evaluation ? 'Edit Evaluation' : 'Start Evaluation'
    };
}

/**
 * Start or resume an evaluation for a project
 * Creates a new empty evaluation if one doesn't exist for the given type
 */
export function ensureEvaluationExists(
    projectId: string,
    evalType: EvaluationType
): boolean {
    const project = getProject(projectId);
    if (!project) return false;

    if (!project.evaluations[evalType]) {
        project.evaluations[evalType] = createEmptyEvaluation(evalType);
        saveProject(project);
    }
    return true;
}
