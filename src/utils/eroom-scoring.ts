/**
 * EROOM Optimization Framework Scoring
 * Based on Boavizta's EOF v1.1
 */

// Impact weights
export const IMPACT_WEIGHTS = {
  Decisive: 3,
  Significant: 2,
  Moderate: 1
} as const

export type ImpactLevel = keyof typeof IMPACT_WEIGHTS

// Answer types for standard categories (1-5)
export type StandardAnswer =
  | 'to_evaluate'
  | 'evaluation_in_progress'
  | 'strength_confirmed'
  | 'improvement_potential'
  | 'not_applicable'

// Answer types for ease of change category (6)
export type EaseOfChangeAnswer =
  | 'to_evaluate'
  | 'evaluation_in_progress'
  | 'easy_to_change'
  | 'moderate_effort'
  | 'hard_to_change'
  | 'not_applicable'

// Answer type for quick diagnosis (0)
export type QuickDiagnosisAnswer = number | null // 1-5

// Union type for all EROOM answers
export type EroomAnswerValue = StandardAnswer | EaseOfChangeAnswer | QuickDiagnosisAnswer

export interface EroomAnswers {
  [questionId: string]: EroomAnswerValue
}

export interface EroomQuestion {
  id: string
  criteria: string
  additionalExplanation?: string
  waysOfEvaluation?: string
  impactLevel: ImpactLevel
  impactWeight: number
  evaluationScale?: Array<{ value: number; label: string }>
}

export interface EroomCategory {
  id: string
  name: string
  icon: string
  description: string
  includeInScore: boolean
  evaluationScaleType: 'quickDiagnosis' | 'standard' | 'easeOfChange'
  questions: EroomQuestion[]
}

export interface CategoryScore {
  categoryId: string
  categoryName: string
  score: number // 0-100%
  earnedScore: number
  maxPossibleScore: number
  answeredQuestions: number
  totalQuestions: number
}

/**
 * Check if an answer should be excluded from calculation
 */
const isExcludedAnswer = (answer: EroomAnswerValue): boolean => {
  return (
    answer === 'to_evaluate' ||
    answer === 'evaluation_in_progress' ||
    answer === 'not_applicable' ||
    answer === null ||
    answer === undefined
  )
}

/**
 * Calculate score contribution for a standard category answer (categories 1-5)
 */
const calculateStandardScore = (answer: StandardAnswer, impactWeight: number): number => {
  if (answer === 'improvement_potential') {
    return impactWeight
  }
  // 'strength_confirmed' contributes 0
  return 0
}

/**
 * Calculate score contribution for ease of change category answer (category 6)
 */
const calculateEaseOfChangeScore = (answer: EaseOfChangeAnswer, impactWeight: number): number => {
  switch (answer) {
    case 'hard_to_change':
      return impactWeight
    case 'moderate_effort':
      return impactWeight * 0.5
    case 'easy_to_change':
    default:
      return 0
  }
}

/**
 * Calculate score for a single category
 */
export const calculateCategoryScore = (
  answers: EroomAnswers,
  category: EroomCategory
): CategoryScore => {
  let earnedScore = 0
  let maxPossibleScore = 0
  let answeredQuestions = 0

  category.questions.forEach((question) => {
    const answer = answers[question.id]
    const impactWeight = question.impactWeight

    // Skip excluded answers
    if (isExcludedAnswer(answer)) {
      return
    }

    answeredQuestions++
    maxPossibleScore += impactWeight

    if (category.evaluationScaleType === 'standard') {
      earnedScore += calculateStandardScore(answer as StandardAnswer, impactWeight)
    } else if (category.evaluationScaleType === 'easeOfChange') {
      earnedScore += calculateEaseOfChangeScore(answer as EaseOfChangeAnswer, impactWeight)
    }
    // quickDiagnosis is not included in score
  })

  const score = maxPossibleScore > 0
    ? Math.round((earnedScore / maxPossibleScore) * 100)
    : 0

  return {
    categoryId: category.id,
    categoryName: category.name,
    score,
    earnedScore,
    maxPossibleScore,
    answeredQuestions,
    totalQuestions: category.questions.length
  }
}

/**
 * Calculate Quick Diagnosis score (category 0)
 * Returns average of all answered questions (1-5 scale)
 * Lower score = higher optimization potential
 */
export const calculateQuickDiagnosisScore = (
  answers: EroomAnswers,
  questions: EroomQuestion[]
): { score: number; answeredCount: number; totalCount: number } => {
  let totalScore = 0
  let answeredCount = 0

  questions.forEach((question) => {
    const answer = answers[question.id]
    if (typeof answer === 'number' && answer >= 1 && answer <= 5) {
      totalScore += answer
      answeredCount++
    }
  })

  return {
    score: answeredCount > 0 ? Math.round((totalScore / answeredCount) * 20) : 0, // Convert 1-5 to 0-100
    answeredCount,
    totalCount: questions.length
  }
}

/**
 * Calculate global EROOM score (average of categories 1-6)
 */
export const calculateEroomGlobalScore = (
  answers: EroomAnswers,
  categories: EroomCategory[]
): { globalScore: number; categoryScores: CategoryScore[] } => {
  const categoryScores: CategoryScore[] = []
  let totalCategoryScore = 0
  let scoredCategories = 0

  categories.forEach((category) => {
    // Skip category 0 (Quick Diagnosis) from global score
    if (!category.includeInScore) {
      return
    }

    const categoryScore = calculateCategoryScore(answers, category)
    categoryScores.push(categoryScore)

    // Only include categories with answered questions
    if (categoryScore.answeredQuestions > 0) {
      totalCategoryScore += categoryScore.score
      scoredCategories++
    }
  })

  const globalScore = scoredCategories > 0
    ? Math.round(totalCategoryScore / scoredCategories)
    : 0

  return {
    globalScore,
    categoryScores
  }
}

/**
 * Get interpretation text based on score
 */
export const getScoreInterpretation = (score: number): {
  level: string
  description: string
  color: string
} => {
  if (score <= 25) {
    return {
      level: 'Mature',
      description: 'Very mature service, few optimizations needed',
      color: '#10b981' // green
    }
  }
  if (score <= 50) {
    return {
      level: 'Moderate',
      description: 'Some improvement opportunities identified',
      color: '#84cc16' // lime
    }
  }
  if (score <= 75) {
    return {
      level: 'Significant',
      description: 'Significant optimization potential',
      color: '#f59e0b' // amber
    }
  }
  return {
    level: 'High',
    description: 'High optimization potential - high priority',
    color: '#ef4444' // red
  }
}

/**
 * Get ranking based on EROOM score
 * Note: EROOM score is inverted (high = more optimization needed)
 */
export const getEroomRanking = (score: number): 'A' | 'B' | 'C' | 'D' | 'E' => {
  // Lower score = more mature = better ranking
  if (score <= 20) return 'A'
  if (score <= 40) return 'B'
  if (score <= 60) return 'C'
  if (score <= 80) return 'D'
  return 'E'
}
