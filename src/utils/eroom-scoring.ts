/**
 * EROOM Optimization Framework Scoring
 * Based on Boavizta's EOF v1.1
 */

import type {
  ImpactLevel,
  StandardAnswer,
  EaseOfChangeAnswer,
  EroomAnswerValue,
  EroomQuestion,
  EroomCategory,
  CategoryScore
} from '../types/eroom'
import { ProjectRanking } from '../types/common'

// Re-export types for consumers that imported from here
export type {
  ImpactLevel,
  StandardAnswer,
  EaseOfChangeAnswer,
  EroomAnswerValue,
  EroomQuestion,
  EroomCategory,
  CategoryScore
}

export interface EroomAnswers {
  [questionId: string]: EroomAnswerValue
}

/**
 * Derive scoring weight from impact weight.
 * Data model uses 3/2/1 (Decisive/Significant/Moderate).
 * Reference spreadsheet scoring uses 2/1.5/1.
 */
const getScoringWeight = (impactWeight: number): number => {
  return (impactWeight + 1) / 2
}

/**
 * Check if an answer is present (not null/undefined).
 * All present answers (including to_evaluate, not_applicable) count in the denominator.
 */
const isAnswerPresent = (answer: EroomAnswerValue): boolean => {
  return answer !== null && answer !== undefined
}

/**
 * Calculate score contribution for a standard category answer (categories 1-5)
 * - improvement_potential: full scoring weight
 * - evaluation_in_progress: half scoring weight
 * - strength_confirmed, to_evaluate, not_applicable: 0
 */
const calculateStandardScore = (answer: EroomAnswerValue, scoringWeight: number): number => {
  if (answer === 'improvement_potential') {
    return scoringWeight
  }
  if (answer === 'evaluation_in_progress') {
    return scoringWeight * 0.5
  }
  return 0
}

/**
 * Calculate score contribution for ease of change category answer (category 6)
 * - easy_to_change: 0.75 × scoring weight
 * - moderate_effort: 0.5 × scoring weight
 * - hard_to_change: 0.25 × scoring weight
 * - to_evaluate, not_applicable: 0
 */
const calculateEaseOfChangeScore = (answer: EroomAnswerValue, scoringWeight: number): number => {
  switch (answer) {
    case 'easy_to_change':
      return scoringWeight * 0.75
    case 'moderate_effort':
      return scoringWeight * 0.5
    case 'hard_to_change':
      return scoringWeight * 0.25
    default:
      return 0
  }
}

/**
 * Calculate score for a single category.
 * All present answers (including to_evaluate, not_applicable) count in the denominator.
 * Only null/undefined answers are excluded entirely.
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
    const scoringWeight = getScoringWeight(question.impactWeight)

    // Only null/undefined are excluded entirely
    if (!isAnswerPresent(answer)) {
      return
    }

    // All present answers contribute to the denominator
    maxPossibleScore += scoringWeight

    // Track actively answered questions for progress display
    if (answer !== 'to_evaluate' && answer !== 'evaluation_in_progress') {
      answeredQuestions++
    }

    if (category.evaluationScaleType === 'standard') {
      earnedScore += calculateStandardScore(answer, scoringWeight)
    } else if (category.evaluationScaleType === 'easeOfChange') {
      earnedScore += calculateEaseOfChangeScore(answer, scoringWeight)
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
    // Scale factor converts 1-5 range to 0-100 percentage
    score: answeredCount > 0 ? Math.round((totalScore / answeredCount) * (100 / 5)) : 0,
    answeredCount,
    totalCount: questions.length
  }
}

/**
 * Calculate global EROOM score.
 * Uses total earned / total max for standard categories (1-5).
 * Ease of Change (category 6) is calculated but excluded from global score.
 */
export const calculateEroomGlobalScore = (
  answers: EroomAnswers,
  categories: EroomCategory[]
): { globalScore: number; categoryScores: CategoryScore[] } => {
  const categoryScores: CategoryScore[] = []
  let totalEarned = 0
  let totalMax = 0

  categories.forEach((category) => {
    // Skip category 0 (Quick Diagnosis)
    if (!category.includeInScore) {
      return
    }

    const categoryScore = calculateCategoryScore(answers, category)
    categoryScores.push(categoryScore)

    // Only standard categories (1-5) contribute to global score
    if (category.evaluationScaleType === 'standard') {
      totalEarned += categoryScore.earnedScore
      totalMax += categoryScore.maxPossibleScore
    }
  })

  const globalScore = totalMax > 0
    ? Math.round((totalEarned / totalMax) * 100)
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
export const getEroomRanking = (score: number): ProjectRanking => {
  // Lower score = more mature = better ranking
  if (score <= 20) return ProjectRanking.A
  if (score <= 40) return ProjectRanking.B
  if (score <= 60) return ProjectRanking.C
  if (score <= 80) return ProjectRanking.D
  return ProjectRanking.E
}

/**
 * Check if a question is considered "answered" (not pending evaluation)
 * A question is unanswered if: to_evaluate, evaluation_in_progress, null, or undefined
 */
const isQuestionAnswered = (answer: EroomAnswerValue): boolean => {
  return (
    answer !== null &&
    answer !== undefined &&
    answer !== 'to_evaluate' &&
    answer !== 'evaluation_in_progress'
  )
}

/**
 * Validation result for EROOM evaluation completeness
 */
export interface EroomValidationResult {
  isComplete: boolean
  totalQuestions: number
  answeredQuestions: number
  missingQuestions: Array<{ categoryName: string; questionId: string; criteria: string }>
}

/**
 * Validate that all EROOM questions have been answered
 * Returns validation result with details about missing answers
 */
export const validateEroomCompletion = (
  answers: EroomAnswers,
  categories: EroomCategory[]
): EroomValidationResult => {
  let totalQuestions = 0
  let answeredQuestions = 0
  const missingQuestions: EroomValidationResult['missingQuestions'] = []

  categories.forEach((category) => {
    category.questions.forEach((question) => {
      totalQuestions++
      const answer = answers[question.id]

      if (isQuestionAnswered(answer)) {
        answeredQuestions++
      } else {
        missingQuestions.push({
          categoryName: category.name,
          questionId: question.id,
          criteria: question.criteria
        })
      }
    })
  })

  return {
    isComplete: missingQuestions.length === 0,
    totalQuestions,
    answeredQuestions,
    missingQuestions
  }
}
