import { describe, it, expect, vi } from 'vitest'

// Mock dashboard service to avoid storage dependency
vi.mock('../../../src/services/dashboard', () => ({
  getDashboardStats: vi.fn(),
  getProjectsWithEvaluation: vi.fn(),
  getAllProjectsWithAnyEvaluation: vi.fn(),
  getChartData: vi.fn()
}))

import { getRanking, getScoreColor, formatDate, getEvaluationTypeName, RankingResult } from '../../../src/utils/ui'
import { EvaluationType } from '../../../src/types/evaluation'

// ============================================================================
// getRanking
// ============================================================================

describe('getRanking', () => {
  it('returns A for score >= 90', () => {
    expect(getRanking(90)).toBe(RankingResult.A)
    expect(getRanking(100)).toBe(RankingResult.A)
  })

  it('returns B for score >= 75 and < 90', () => {
    expect(getRanking(75)).toBe(RankingResult.B)
    expect(getRanking(89)).toBe(RankingResult.B)
  })

  it('returns C for score >= 50 and < 75', () => {
    expect(getRanking(50)).toBe(RankingResult.C)
    expect(getRanking(74)).toBe(RankingResult.C)
  })

  it('returns D for score >= 25 and < 50', () => {
    expect(getRanking(25)).toBe(RankingResult.D)
    expect(getRanking(49)).toBe(RankingResult.D)
  })

  it('returns E for score < 25', () => {
    expect(getRanking(0)).toBe(RankingResult.E)
    expect(getRanking(24)).toBe(RankingResult.E)
  })
})

// ============================================================================
// getScoreColor
// ============================================================================

describe('getScoreColor', () => {
  it('returns excellent for low EROOM score (mature service)', () => {
    expect(getScoreColor(20, EvaluationType.EROOM)).toBe('var(--color-score-excellent)')
  })

  it('returns good for moderate EROOM score', () => {
    expect(getScoreColor(40, EvaluationType.EROOM)).toBe('var(--color-score-good)')
  })

  it('returns average for significant EROOM score', () => {
    expect(getScoreColor(60, EvaluationType.EROOM)).toBe('var(--color-score-average)')
  })

  it('returns poor for high EROOM score (needs optimization)', () => {
    expect(getScoreColor(80, EvaluationType.EROOM)).toBe('var(--color-score-poor)')
  })

  it('uses getRanking color for API_GREEN_SCORE', () => {
    expect(getScoreColor(95, EvaluationType.API_GREEN_SCORE)).toBe('var(--color-score-excellent)')
    expect(getScoreColor(10, EvaluationType.API_GREEN_SCORE)).toBe('var(--color-score-poor)')
  })
})

// ============================================================================
// formatDate
// ============================================================================

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-01-15T12:00:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('returns N/A for empty string', () => {
    expect(formatDate('')).toBe('N/A')
  })
})

// ============================================================================
// getEvaluationTypeName
// ============================================================================

describe('getEvaluationTypeName', () => {
  it('returns display name for API Green Score', () => {
    const name = getEvaluationTypeName(EvaluationType.API_GREEN_SCORE)
    expect(name).toBeTruthy()
    expect(typeof name).toBe('string')
  })

  it('returns display name for EROOM', () => {
    const name = getEvaluationTypeName(EvaluationType.EROOM)
    expect(name).toBeTruthy()
    expect(typeof name).toBe('string')
  })
})
