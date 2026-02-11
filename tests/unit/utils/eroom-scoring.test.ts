import { describe, it, expect } from 'vitest'
import {
  calculateCategoryScore,
  calculateQuickDiagnosisScore,
  calculateEroomGlobalScore,
  getScoreInterpretation,
  getEroomRanking,
  validateEroomCompletion
} from '../../../src/utils/eroom-scoring'
import type { EroomCategory } from '../../../src/types/eroom'
import { ProjectRanking } from '../../../src/types/common'

// ============================================================================
// TEST FIXTURES
// ============================================================================

const makeCategory = (overrides: Partial<EroomCategory> = {}): EroomCategory => ({
  id: '1',
  name: 'Test Category',
  icon: '🔧',
  description: 'Test',
  includeInScore: true,
  evaluationScaleType: 'standard',
  questions: [
    { id: 'q1', criteria: 'Q1', impactLevel: 'Decisive', impactWeight: 3 },
    { id: 'q2', criteria: 'Q2', impactLevel: 'Significant', impactWeight: 2 },
    { id: 'q3', criteria: 'Q3', impactLevel: 'Moderate', impactWeight: 1 }
  ],
  ...overrides
})

const makeEaseOfChangeCategory = (): EroomCategory => makeCategory({
  id: '6',
  name: 'Ease of Change',
  evaluationScaleType: 'easeOfChange'
})

const makeQuickDiagnosisCategory = (): EroomCategory => makeCategory({
  id: '0',
  name: 'Quick Diagnosis',
  includeInScore: false,
  evaluationScaleType: 'quickDiagnosis'
})

// ============================================================================
// calculateCategoryScore
// ============================================================================

describe('calculateCategoryScore', () => {
  it('returns 0 when no answers are provided', () => {
    const result = calculateCategoryScore({}, makeCategory())
    expect(result.score).toBe(0)
    expect(result.answeredQuestions).toBe(0)
    expect(result.totalQuestions).toBe(3)
  })

  it('returns 0 when all answers are to_evaluate', () => {
    const answers = { q1: 'to_evaluate' as const, q2: 'to_evaluate' as const, q3: 'to_evaluate' as const }
    const result = calculateCategoryScore(answers, makeCategory())
    expect(result.score).toBe(0)
    expect(result.answeredQuestions).toBe(0)
  })

  it('calculates standard score with improvement_potential answers', () => {
    const answers = {
      q1: 'improvement_potential' as const, // weight 3
      q2: 'strength_confirmed' as const,    // weight 0
      q3: 'improvement_potential' as const   // weight 1
    }
    const result = calculateCategoryScore(answers, makeCategory())
    // earned = 3 + 0 + 1 = 4, max = 3 + 2 + 1 = 6
    expect(result.earnedScore).toBe(4)
    expect(result.maxPossibleScore).toBe(6)
    expect(result.score).toBe(67) // Math.round(4/6 * 100)
    expect(result.answeredQuestions).toBe(3)
  })

  it('excludes not_applicable answers from max possible', () => {
    const answers = {
      q1: 'improvement_potential' as const, // weight 3
      q2: 'not_applicable' as const,        // excluded
      q3: 'strength_confirmed' as const     // weight 0
    }
    const result = calculateCategoryScore(answers, makeCategory())
    // earned = 3, max = 3 + 1 = 4 (q2 excluded)
    expect(result.earnedScore).toBe(3)
    expect(result.maxPossibleScore).toBe(4)
    expect(result.answeredQuestions).toBe(2)
  })

  it('calculates ease of change scores correctly', () => {
    const category = makeEaseOfChangeCategory()
    const answers = {
      q1: 'hard_to_change' as const,   // weight * 1
      q2: 'moderate_effort' as const,  // weight * 0.5
      q3: 'easy_to_change' as const    // 0
    }
    const result = calculateCategoryScore(answers, category)
    // earned = 3 + 1 + 0 = 4, max = 3 + 2 + 1 = 6
    expect(result.earnedScore).toBe(4)
    expect(result.maxPossibleScore).toBe(6)
    expect(result.score).toBe(67)
  })

  it('returns all strengths confirmed as score 0', () => {
    const answers = {
      q1: 'strength_confirmed' as const,
      q2: 'strength_confirmed' as const,
      q3: 'strength_confirmed' as const
    }
    const result = calculateCategoryScore(answers, makeCategory())
    expect(result.score).toBe(0)
    expect(result.earnedScore).toBe(0)
    expect(result.maxPossibleScore).toBe(6)
  })
})

// ============================================================================
// calculateQuickDiagnosisScore
// ============================================================================

describe('calculateQuickDiagnosisScore', () => {
  const questions = makeQuickDiagnosisCategory().questions

  it('returns 0 when no answers are provided', () => {
    const result = calculateQuickDiagnosisScore({}, questions)
    expect(result.score).toBe(0)
    expect(result.answeredCount).toBe(0)
    expect(result.totalCount).toBe(3)
  })

  it('calculates average score on 0-100 scale', () => {
    const answers = { q1: 3, q2: 4, q3: 5 }
    const result = calculateQuickDiagnosisScore(answers, questions)
    // avg = (3+4+5)/3 = 4, scaled to 0-100 = 4*20 = 80
    expect(result.score).toBe(80)
    expect(result.answeredCount).toBe(3)
  })

  it('ignores null/undefined answers', () => {
    const answers = { q1: 5, q2: null, q3: undefined as unknown as number }
    const result = calculateQuickDiagnosisScore(answers, questions)
    // only q1 counted: 5*20 = 100
    expect(result.score).toBe(100)
    expect(result.answeredCount).toBe(1)
  })

  it('ignores out of range values', () => {
    const answers = { q1: 0, q2: 6, q3: 3 }
    const result = calculateQuickDiagnosisScore(answers, questions)
    // only q3: 3*20 = 60
    expect(result.score).toBe(60)
    expect(result.answeredCount).toBe(1)
  })
})

// ============================================================================
// calculateEroomGlobalScore
// ============================================================================

describe('calculateEroomGlobalScore', () => {
  it('returns 0 with empty answers', () => {
    const categories = [makeCategory({ id: '1' }), makeCategory({ id: '2', name: 'Cat 2' })]
    const result = calculateEroomGlobalScore({}, categories)
    expect(result.globalScore).toBe(0)
    expect(result.categoryScores).toHaveLength(2)
  })

  it('excludes quickDiagnosis category from global score', () => {
    const categories = [
      makeQuickDiagnosisCategory(),
      makeCategory({ id: '1', name: 'Standard' })
    ]
    const answers = {
      q1: 'improvement_potential' as const,
      q2: 'improvement_potential' as const,
      q3: 'improvement_potential' as const
    }
    const result = calculateEroomGlobalScore(answers, categories)
    // Only standard category counted (includeInScore: true)
    expect(result.categoryScores).toHaveLength(1)
    expect(result.globalScore).toBe(100) // all improvement_potential = max score
  })

  it('averages scores across multiple scored categories', () => {
    const cat1 = makeCategory({ id: '1', name: 'Cat 1', questions: [
      { id: 'c1q1', criteria: 'C1Q1', impactLevel: 'Moderate', impactWeight: 1 }
    ]})
    const cat2 = makeCategory({ id: '2', name: 'Cat 2', questions: [
      { id: 'c2q1', criteria: 'C2Q1', impactLevel: 'Moderate', impactWeight: 1 }
    ]})
    const answers = {
      c1q1: 'improvement_potential' as const,  // score 100
      c2q1: 'strength_confirmed' as const       // score 0
    }
    const result = calculateEroomGlobalScore(answers, [cat1, cat2])
    expect(result.globalScore).toBe(50) // (100 + 0) / 2
  })
})

// ============================================================================
// getScoreInterpretation
// ============================================================================

describe('getScoreInterpretation', () => {
  it('returns Mature for score <= 25', () => {
    expect(getScoreInterpretation(0).level).toBe('Mature')
    expect(getScoreInterpretation(25).level).toBe('Mature')
  })

  it('returns Moderate for score 26-50', () => {
    expect(getScoreInterpretation(26).level).toBe('Moderate')
    expect(getScoreInterpretation(50).level).toBe('Moderate')
  })

  it('returns Significant for score 51-75', () => {
    expect(getScoreInterpretation(51).level).toBe('Significant')
    expect(getScoreInterpretation(75).level).toBe('Significant')
  })

  it('returns High for score > 75', () => {
    expect(getScoreInterpretation(76).level).toBe('High')
    expect(getScoreInterpretation(100).level).toBe('High')
  })
})

// ============================================================================
// getEroomRanking
// ============================================================================

describe('getEroomRanking', () => {
  it('returns A for score <= 20', () => {
    expect(getEroomRanking(0)).toBe(ProjectRanking.A)
    expect(getEroomRanking(20)).toBe(ProjectRanking.A)
  })

  it('returns B for score 21-40', () => {
    expect(getEroomRanking(21)).toBe(ProjectRanking.B)
    expect(getEroomRanking(40)).toBe(ProjectRanking.B)
  })

  it('returns C for score 41-60', () => {
    expect(getEroomRanking(41)).toBe(ProjectRanking.C)
    expect(getEroomRanking(60)).toBe(ProjectRanking.C)
  })

  it('returns D for score 61-80', () => {
    expect(getEroomRanking(61)).toBe(ProjectRanking.D)
    expect(getEroomRanking(80)).toBe(ProjectRanking.D)
  })

  it('returns E for score > 80', () => {
    expect(getEroomRanking(81)).toBe(ProjectRanking.E)
    expect(getEroomRanking(100)).toBe(ProjectRanking.E)
  })
})

// ============================================================================
// validateEroomCompletion
// ============================================================================

describe('validateEroomCompletion', () => {
  it('reports all missing when no answers', () => {
    const categories = [makeCategory()]
    const result = validateEroomCompletion({}, categories)
    expect(result.isComplete).toBe(false)
    expect(result.answeredQuestions).toBe(0)
    expect(result.totalQuestions).toBe(3)
    expect(result.missingQuestions).toHaveLength(3)
  })

  it('reports complete when all answered', () => {
    const categories = [makeCategory()]
    const answers = {
      q1: 'strength_confirmed' as const,
      q2: 'improvement_potential' as const,
      q3: 'not_applicable' as const
    }
    const result = validateEroomCompletion(answers, categories)
    expect(result.isComplete).toBe(true)
    expect(result.answeredQuestions).toBe(3)
    expect(result.missingQuestions).toHaveLength(0)
  })

  it('does not count to_evaluate as answered', () => {
    const categories = [makeCategory()]
    const answers = {
      q1: 'strength_confirmed' as const,
      q2: 'to_evaluate' as const,
      q3: 'not_applicable' as const
    }
    const result = validateEroomCompletion(answers, categories)
    expect(result.isComplete).toBe(false)
    expect(result.answeredQuestions).toBe(2)
    expect(result.missingQuestions).toHaveLength(1)
    expect(result.missingQuestions[0].questionId).toBe('q2')
  })

  it('does not count evaluation_in_progress as answered', () => {
    const categories = [makeCategory()]
    const answers = {
      q1: 'evaluation_in_progress' as const,
      q2: 'strength_confirmed' as const,
      q3: 'strength_confirmed' as const
    }
    const result = validateEroomCompletion(answers, categories)
    expect(result.isComplete).toBe(false)
    expect(result.answeredQuestions).toBe(2)
  })
})
