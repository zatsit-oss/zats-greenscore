import { describe, it, expect } from 'vitest'
import {
  calculateProjectScore,
  getRankingScore,
  calculateScoresBySection,
  type Question,
  type Answers
} from '../../../src/utils/apigreenscore-scoring'
import { ProjectRanking } from '../../../src/types/common'

// ============================================================================
// TEST FIXTURES
// ============================================================================

const makeQuestion = (overrides: Partial<Question> = {}): Question => ({
  section: 'Architecture',
  id: 'q1',
  question: 'Test question?',
  description: 'Test',
  points: 1000,
  ...overrides
})

const sampleQuestions: Question[] = [
  makeQuestion({ id: 'q1', section: 'Architecture', points: 2000 }),
  makeQuestion({ id: 'q2', section: 'Architecture', points: 1000 }),
  makeQuestion({ id: 'q3', section: 'Design', points: 3000 }),
  makeQuestion({ id: 'q4', section: 'Usage', points: 1000 }),
  makeQuestion({ id: 'q5', section: 'Logs', points: 500 })
]

// ============================================================================
// calculateProjectScore
// ============================================================================

describe('calculateProjectScore', () => {
  it('returns 0 when no answers', () => {
    const result = calculateProjectScore({}, sampleQuestions)
    expect(result.avg).toBe(0)
    expect(result.points).toBe(0)
  })

  it('returns 0 when all checkboxes are false', () => {
    const answers: Answers = { q1: false, q2: false, q3: false, q4: false, q5: false }
    const result = calculateProjectScore(answers, sampleQuestions)
    expect(result.avg).toBe(0)
    expect(result.points).toBe(0)
  })

  it('scores full points for checked checkboxes', () => {
    const answers: Answers = { q1: true, q2: true, q3: true, q4: true, q5: true }
    const result = calculateProjectScore(answers, sampleQuestions)
    expect(result.avg).toBe(100)
    expect(result.points).toBe(7500) // 2000+1000+3000+1000+500
  })

  it('scores partial points with some checked', () => {
    const answers: Answers = { q1: true, q2: false, q3: true }
    const result = calculateProjectScore(answers, sampleQuestions)
    // earned = 2000 + 3000 = 5000, max = 7500
    expect(result.avg).toBe(67) // Math.round(5000/7500*100)
    expect(result.points).toBe(5000)
  })

  it('handles formula-based questions', () => {
    const questions: Question[] = [
      makeQuestion({ id: 'q1', points: 1000, formula: 'x' })
    ]
    const answers: Answers = { q1: '50' }
    const result = calculateProjectScore(answers, questions)
    // formula: x=50, capped to 0-100, points = 1000 * 50/100 = 500
    expect(result.points).toBe(500)
    expect(result.avg).toBe(50)
  })

  it('clamps formula results to 0-100', () => {
    const questions: Question[] = [
      makeQuestion({ id: 'q1', points: 1000, formula: 'x * 2' })
    ]
    const answers: Answers = { q1: '80' }
    const result = calculateProjectScore(answers, questions)
    // formula: 80*2=160, clamped to 100, points = 1000
    expect(result.points).toBe(1000)
    expect(result.avg).toBe(100)
  })

  it('returns 0 for empty questions array', () => {
    const result = calculateProjectScore({ q1: true }, [])
    expect(result.avg).toBe(0)
    expect(result.points).toBe(0)
  })
})

// ============================================================================
// getRankingScore
// ============================================================================

describe('getRankingScore', () => {
  it('returns A for points >= 6000', () => {
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 6000 })])).toBe(ProjectRanking.A)
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 10000 })])).toBe(ProjectRanking.A)
  })

  it('returns B for points 3000-5999', () => {
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 3000 })])).toBe(ProjectRanking.B)
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 5999 })])).toBe(ProjectRanking.B)
  })

  it('returns C for points 2000-2999', () => {
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 2000 })])).toBe(ProjectRanking.C)
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 2999 })])).toBe(ProjectRanking.C)
  })

  it('returns D for points 1000-1999', () => {
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 1000 })])).toBe(ProjectRanking.D)
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 1999 })])).toBe(ProjectRanking.D)
  })

  it('returns E for points < 1000', () => {
    expect(getRankingScore({ q1: true }, [makeQuestion({ id: 'q1', points: 999 })])).toBe(ProjectRanking.E)
    expect(getRankingScore({}, [makeQuestion({ id: 'q1', points: 5000 })])).toBe(ProjectRanking.E)
  })
})

// ============================================================================
// calculateScoresBySection
// ============================================================================

describe('calculateScoresBySection', () => {
  it('returns empty array for no questions', () => {
    const result = calculateScoresBySection({}, [])
    expect(result).toEqual([])
  })

  it('calculates scores per section', () => {
    const answers: Answers = { q1: true, q2: false, q3: true }
    const result = calculateScoresBySection(answers, sampleQuestions)

    const arch = result.find(s => s.section === 'Architecture')
    expect(arch).toBeDefined()
    // Architecture: q1(2000)=true, q2(1000)=false → 2000/3000 = 67%
    expect(arch!.score).toBe(67)
    expect(arch!.earnedPoints).toBe(2000)
    expect(arch!.maxPoints).toBe(3000)

    const design = result.find(s => s.section === 'Design')
    expect(design).toBeDefined()
    // Design: q3(3000)=true → 3000/3000 = 100%
    expect(design!.score).toBe(100)
  })

  it('sorts sections by predefined order', () => {
    const answers: Answers = { q1: true, q2: true, q3: true, q4: true, q5: true }
    const result = calculateScoresBySection(answers, sampleQuestions)
    expect(result.map(s => s.section)).toEqual(['Architecture', 'Design', 'Usage', 'Logs'])
  })

  it('returns 0 for sections with no correct answers', () => {
    const answers: Answers = { q1: false, q2: false }
    const result = calculateScoresBySection(answers, sampleQuestions)
    const arch = result.find(s => s.section === 'Architecture')
    expect(arch!.score).toBe(0)
    expect(arch!.earnedPoints).toBe(0)
  })
})
