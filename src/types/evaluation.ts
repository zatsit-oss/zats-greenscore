/**
 * Types for evaluation system supporting multiple evaluation types
 */

import {ProjectRanking} from './common';
import frameworks from '../data/frameworks.json';

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
    /** Provenance of the embedded framework, loaded from src/data/frameworks.json */
    source: string;
    version: string;
    /** Public page cited for attribution */
    sourceUrl: string;
    /** Raw upstream source watched to detect new versions */
    upstreamUrl: string;
    /** Date (YYYY-MM-DD) the embedded data was last synced with upstream */
    syncedAt: string;
    /** Optional preliminary assessment step configuration */
    preliminary?: PreliminaryConfig;
}

export const EVALUATION_TYPES: Record<EvaluationType, EvaluationTypeInfo> = {
    [EvaluationType.API_GREEN_SCORE]: {
        id: EvaluationType.API_GREEN_SCORE,
        name: 'API Green Score',
        shortName: 'GreenScore',
        description: 'Evaluate API sustainability based on architecture, design, usage and logs',
        ...frameworks.apigreenscore
    },
    [EvaluationType.EROOM]: {
        id: EvaluationType.EROOM,
        name: 'EROOM',
        shortName: 'EROOM Score',
        description: 'EROOM Optimization Framework - Digital service optimization potential assessment',
        ...frameworks.eroom,
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
    /**
     * Framework version the evaluation was started with.
     * Undefined for evaluations created before this field existed.
     */
    frameworkVersion?: string;
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
 * Variables exposed to content templates, e.g. "EROOM (EOF v{{eroom.version}})"
 */
export function getFrameworkTemplateVars(): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const info of Object.values(EVALUATION_TYPES)) {
        vars[`${info.id}.version`] = info.version;
        vars[`${info.id}.sourceUrl`] = info.sourceUrl;
    }
    return vars;
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
        startedAt: new Date().toISOString(),
        frameworkVersion: EVALUATION_TYPES[type].version
    };
}
