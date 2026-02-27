/**
 * Types for API Green Score evaluation
 *
 * These domain types were extracted from utils/apigreenscore-scoring.ts
 * to respect the architecture: types belong in src/types/.
 */

export interface Question {
    section: string;
    id: string;
    question: string;
    description: string;
    tooltip?: string;
    example?: string;
    points: number;
    formula?: string;
}

export interface Answers {
    [key: string]: boolean | string | number;
}
