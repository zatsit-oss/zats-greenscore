/**
 * Types for evaluation system supporting multiple evaluation types
 */

import {ProjectRanking} from './common';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Available evaluation types
 */
export enum EvaluationType {
    API_GREEN_SCORE = 'apigreenscore',
    EROOM = 'eroom'
}

export enum EvaluationStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

// ============================================================================
// EVALUATION METADATA
// ============================================================================

// ============================================================================
// PRELIMINARY ASSESSMENT CONFIG
// ============================================================================

export interface PreliminaryConfig {
    /** Display label for this preliminary step (e.g. "Quick Diagnosis") */
    label: string;
    /** If true, the user must reach minScore before accessing advanced steps */
    blocking: boolean;
    /** Minimum score required to proceed (only used when blocking is true) */
    minScore?: number;
    /** Score thresholds for recommendation messages */
    thresholds: { low: number; high: number };
    /** Recommendation messages based on score vs thresholds */
    recommendations: {
        low: string;
        medium: string;
        high: string;
    };
}

// ============================================================================
// EVALUATION TYPE METADATA
// ============================================================================

export interface EvaluationTypeInfo {
    id: EvaluationType;
    name: string;
    shortName: string;
    description: string;
    source: string;
    version: string;
    /** Optional preliminary assessment step configuration */
    preliminary?: PreliminaryConfig;
}

export const EVALUATION_TYPES: Record<EvaluationType, EvaluationTypeInfo> = {
    [EvaluationType.API_GREEN_SCORE]: {
        id: EvaluationType.API_GREEN_SCORE,
        name: 'API Green Score',
        shortName: 'GreenScore',
        description: 'Evaluate API sustainability based on architecture, design, usage and logs',
        source: 'API Green Score',
        version: '1.0'
    },
    [EvaluationType.EROOM]: {
        id: EvaluationType.EROOM,
        name: 'EROOM',
        shortName: 'EROOM Score',
        description: 'EROOM Optimization Framework - Digital service optimization potential assessment',
        source: 'Boavizta',
        version: '1.1',
        preliminary: {
            label: 'Quick Diagnosis',
            blocking: false,
            thresholds: { low: 25, high: 50 },
            recommendations: {
                low: 'Service appears mature. Advanced diagnosis is optional.',
                medium: 'Moderate optimization potential. Advanced diagnosis recommended.',
                high: 'Significant optimization potential. Advanced diagnosis strongly recommended.',
            }
        }
    }
};

// ============================================================================
// EVALUATION ANSWERS
// ============================================================================

export interface EvaluationAnswers {
    [questionId: string]: boolean | string | number;
}

// ============================================================================
// EVALUATION
// ============================================================================

export interface Evaluation {
    type: EvaluationType;
    status: EvaluationStatus;
    answers: EvaluationAnswers;
    score: number | null;
    ranking: ProjectRanking | null;
    startedAt: string;
    completedAt?: string;
    answeredQuestions?: number;
    totalQuestions?: number;
    /** Score from the preliminary assessment step (0-100), if applicable */
    preliminaryScore?: number | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get available evaluation types as array for dropdowns
 */
export function getAvailableEvaluationTypes(): EvaluationTypeInfo[] {
    return Object.values(EVALUATION_TYPES);
}

/**
 * Get evaluation type info by id
 */
export function getEvaluationTypeInfo(type: EvaluationType): EvaluationTypeInfo {
    return EVALUATION_TYPES[type];
}

/**
 * Create a new empty evaluation
 */
export function createEmptyEvaluation(type: EvaluationType): Evaluation {
    return {
        type,
        status: EvaluationStatus.IN_PROGRESS,
        answers: {},
        score: null,
        ranking: null,
        startedAt: new Date().toISOString()
    };
}
