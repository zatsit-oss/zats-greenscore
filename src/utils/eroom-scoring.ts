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
    // Scale factor converts 1-5 range to 0-100 percentage
    score: answeredCount > 0 ? Math.round((totalScore / answeredCount) * (100 / 5)) : 0,
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
