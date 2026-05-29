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
import type {PreliminaryConfig} from '../types/evaluation';
import type {Question} from '../types/apigreenscore';
import type {EroomAnswerValue, EroomCategory} from '../types/eroom';
import {getProject, saveProject} from './project-service';
import {getScoreDetailsByType, prepareChartData} from './evaluation-service';
import type {ScoreDetails, ChartDataPoint} from './evaluation-service';
import {getScoreInterpretation, hasAdvancedAnswers} from '../utils/eroom-scoring';

// ============================================================================
// TYPES
// ============================================================================

export interface PreliminaryDisplayData {
    score: number;
    details: ScoreDetails;
    label: string;
    recommendation: string;
    blocking: boolean;
    blocked: boolean;
}

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
    preliminary: PreliminaryDisplayData | null;
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Build the recommendation message based on score and config thresholds
 */
function getPreliminaryRecommendation(score: number, config: PreliminaryConfig): string {
    if (score <= config.thresholds.low) return config.recommendations.low
    if (score <= config.thresholds.high) return config.recommendations.medium
    return config.recommendations.high
}

/**
 * Build preliminary display data from evaluation and type config
 * Returns null if the evaluation type has no preliminary step or no score yet
 */
function buildPreliminaryDisplayData(
    evaluation: Evaluation | undefined,
    evalType: EvaluationType
): PreliminaryDisplayData | null {
    const config = EVALUATION_TYPES[evalType].preliminary
    if (!config) return null

    const score = evaluation?.preliminaryScore
    if (score === undefined || score === null) return null

    return {
        score,
        details: getScoreDetailsByType(score, evalType),
        label: config.label,
        recommendation: getPreliminaryRecommendation(score, config),
        blocking: config.blocking,
        blocked: config.blocking && config.minScore !== undefined && score < config.minScore,
    }
}

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
    const storedScore = evaluation?.score ?? null;

    // Status
    let status: EvaluationDisplayData['status'] = 'Not Started';
    let isCompleted = false;
    if (evaluation) {
        isCompleted = evaluation.status === EvaluationStatus.COMPLETED;
        status = isCompleted ? 'Completed' : 'In Progress';
    }

    // Advanced summary gating: when an evaluation type has a preliminary step,
    // the advanced score / chart / context must stay hidden until at least one
    // advanced-category question has been answered. This prevents "step 0 alone"
    // from displaying a misleading score of 0 or an empty radar chart.
    const advancedAvailable = isAdvancedSummaryAvailable(evaluation, evalType, eroomCategories);
    const score = advancedAvailable ? storedScore : null;

    // Score details
    const scoreDetails = score !== null ? getScoreDetailsByType(score, evalType) : null;

    // Score context (EROOM-specific interpretation)
    let scoreContext: string | null = null;
    if (evalType === EvaluationType.EROOM && score !== null) {
        scoreContext = getScoreInterpretation(score).description;
    }

    // Chart data — only built when the advanced summary is unlocked
    let chartData: ChartDataPoint[] = [];
    if (advancedAvailable && evaluation?.answers) {
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

    // Preliminary assessment
    const preliminary = buildPreliminaryDisplayData(evaluation, evalType)
    const hasPreliminary = evalMeta.preliminary !== undefined

    // Adapt score title when a preliminary step exists
    const scoreTitle = hasPreliminary
        ? `Advanced Diagnosis Score`
        : `Current ${evalMeta?.shortName || evalMeta?.name || 'Score'}`

    return {
        evaluation,
        isCompleted,
        status,
        scoreTitle,
        score,
        scoreDetails,
        scoreContext,
        chartData,
        progress,
        auditPageUrl: getAuditPageUrl(evalType, project.id),
        editButtonText: evaluation ? 'Edit Evaluation' : 'Start Evaluation',
        preliminary,
    };
}

/**
 * Decide whether the advanced summary (score, context, radar) should be shown.
 * - For evaluation types without a preliminary step: available as soon as there's any answer.
 * - For EROOM (preliminary step): requires at least one answer in a scored category (1-6).
 */
function isAdvancedSummaryAvailable(
    evaluation: Evaluation | undefined,
    evalType: EvaluationType,
    eroomCategories?: EroomCategory[]
): boolean {
    if (!evaluation?.answers) return false

    const evalMeta = EVALUATION_TYPES[evalType]
    if (!evalMeta.preliminary) {
        return Object.keys(evaluation.answers).length > 0
    }

    if (evalType === EvaluationType.EROOM && eroomCategories) {
        return hasAdvancedAnswers(
            evaluation.answers as Record<string, EroomAnswerValue>,
            eroomCategories
        )
    }

    // Preliminary configured but no category info available: fall back to "any answer".
    return Object.keys(evaluation.answers).length > 0
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
