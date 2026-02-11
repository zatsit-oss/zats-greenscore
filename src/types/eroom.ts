/**
 * Types for EROOM Optimization Framework (EOF v1.1)
 * Source: Boavizta
 */

// ============================================================================
// IMPACT LEVELS
// ============================================================================

export type ImpactLevel = 'Decisive' | 'Significant' | 'Moderate'

export const IMPACT_WEIGHTS: Record<ImpactLevel, number> = {
  Decisive: 3,
  Significant: 2,
  Moderate: 1
}

// ============================================================================
// EVALUATION SCALE TYPES
// ============================================================================

export type EvaluationScaleType = 'quickDiagnosis' | 'standard' | 'easeOfChange'

// ============================================================================
// ANSWER TYPES
// ============================================================================

/**
 * Answer options for standard categories (1-5: Product, Architecture, Infrastructure, Storage & Data, Algo & Code)
 */
export type StandardAnswer =
  | 'to_evaluate'
  | 'evaluation_in_progress'
  | 'strength_confirmed'
  | 'improvement_potential'
  | 'not_applicable'

/**
 * Answer options for category 6 (Ease of Change)
 */
export type EaseOfChangeAnswer =
  | 'to_evaluate'
  | 'evaluation_in_progress'
  | 'easy_to_change'
  | 'moderate_effort'
  | 'hard_to_change'
  | 'not_applicable'

/**
 * Answer for category 0 (Quick Diagnosis) - numeric scale 1-5
 */
export type QuickDiagnosisAnswer = number | null

/**
 * Union type for all EROOM answers
 */
export type EroomAnswerValue = StandardAnswer | EaseOfChangeAnswer | QuickDiagnosisAnswer

// ============================================================================
// STANDARD ANSWER OPTIONS (for UI)
// ============================================================================

export interface AnswerOption {
  id: string
  label: string
  emoji: string
  description: string
  isPositive?: boolean
  effortLevel?: number
}

export const STANDARD_ANSWER_OPTIONS: AnswerOption[] = [
  {
    id: 'to_evaluate',
    label: 'To Evaluate',
    emoji: '🤔',
    description: 'Question not yet evaluated'
  },
  {
    id: 'evaluation_in_progress',
    label: 'Evaluation in progress',
    emoji: '📋',
    description: 'Evaluation ongoing'
  },
  {
    id: 'strength_confirmed',
    label: 'Strength confirmed',
    emoji: '✅',
    description: 'Strength confirmed - no improvement potential',
    isPositive: true
  },
  {
    id: 'improvement_potential',
    label: 'Improvement potential',
    emoji: '💡',
    description: 'Improvement potential identified',
    isPositive: false
  },
  {
    id: 'not_applicable',
    label: 'Not applicable',
    emoji: '🚫',
    description: 'Not applicable to this project'
  }
]

export const EASE_OF_CHANGE_OPTIONS: AnswerOption[] = [
  {
    id: 'to_evaluate',
    label: 'To Evaluate',
    emoji: '🤔',
    description: 'Question not yet evaluated'
  },
  {
    id: 'evaluation_in_progress',
    label: 'Evaluation in progress',
    emoji: '📋',
    description: 'Evaluation ongoing'
  },
  {
    id: 'easy_to_change',
    label: 'Easy to change',
    emoji: '🟢',
    description: 'Easy to change - low effort required',
    effortLevel: 1
  },
  {
    id: 'moderate_effort',
    label: 'Moderate effort',
    emoji: '🟡',
    description: 'Moderate effort required',
    effortLevel: 2
  },
  {
    id: 'hard_to_change',
    label: 'Hard to change',
    emoji: '🔴',
    description: 'Hard to change - significant effort required',
    effortLevel: 3
  },
  {
    id: 'not_applicable',
    label: 'Not applicable',
    emoji: '🚫',
    description: 'Not applicable to this project'
  }
]

// ============================================================================
// QUESTION & CATEGORY INTERFACES
// ============================================================================

export interface QuickDiagnosisScale {
  value: number
  label: string
}

export interface EroomQuestion {
  id: string
  criteria: string
  additionalExplanation?: string
  waysOfEvaluation?: string
  impactLevel: ImpactLevel
  impactWeight: number
  evaluationScale?: QuickDiagnosisScale[]
}

export interface EroomCategory {
  id: string
  name: string
  icon: string
  description: string
  includeInScore: boolean
  evaluationScaleType: EvaluationScaleType
  questions: EroomQuestion[]
}

// ============================================================================
// SCORE INTERFACES
// ============================================================================

export interface CategoryScore {
  categoryId: string
  categoryName: string
  score: number // 0-100%
  earnedScore: number
  maxPossibleScore: number
  answeredQuestions: number
  totalQuestions: number
}

export interface EroomScoreResult {
  globalScore: number
  categoryScores: CategoryScore[]
  quickDiagnosisScore?: {
    score: number
    answeredCount: number
    totalCount: number
  }
}

// ============================================================================
// FULL DATA MODEL INTERFACE
// ============================================================================

export interface EroomDataModel {
  $schema: string
  title: string
  description: string
  version: string
  license: string
  source: string
  metadata: {
    impactLevels: Record<ImpactLevel, { weight: number; description: string }>
    scoring: Record<string, unknown>
    interpretation: Record<string, unknown>
    evaluationScales: Record<string, unknown>
  }
  categories: EroomCategory[]
  synthesis: Record<string, unknown>
  evaluationResponse: Record<string, unknown>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get answer options based on evaluation scale type
 */
export function getAnswerOptions(scaleType: EvaluationScaleType): AnswerOption[] | null {
  switch (scaleType) {
    case 'standard':
      return STANDARD_ANSWER_OPTIONS
    case 'easeOfChange':
      return EASE_OF_CHANGE_OPTIONS
    case 'quickDiagnosis':
      return null // Quick diagnosis uses numeric scale
    default:
      return null
  }
}

/**
 * Get impact level color for badges
 */
export function getImpactLevelColor(level: ImpactLevel): string {
  switch (level) {
    case 'Decisive':
      return '#ef4444' // red
    case 'Significant':
      return '#f59e0b' // amber
    case 'Moderate':
      return '#3b82f6' // blue
    default:
      return '#6b7280' // gray
  }
}

/**
 * Check if a category is the Quick Diagnosis (category 0)
 */
export function isQuickDiagnosis(category: EroomCategory): boolean {
  return category.id === '0' && !category.includeInScore
}
