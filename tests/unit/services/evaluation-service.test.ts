import { describe, it, expect } from 'vitest'
import { EvaluationType } from '../../../src/types/evaluation'
import type { EroomCategory } from '../../../src/types/eroom'
import {
  getApiGreenScoreDetails,
  getEroomScoreDetails,
  getScoreDetailsByType,
  prepareApiGreenScoreChartData,
  prepareEroomChartData,
  prepareChartData
} from '../../../src/services/evaluation-service'

describe('evaluation-service', () => {
  // ==========================================================================
  // getApiGreenScoreDetails
  // ==========================================================================

  describe('getApiGreenScoreDetails', () => {
    it('returns Excellent for score >= 90', () => {
      const result = getApiGreenScoreDetails(95)
      expect(result.text).toBe('Excellent')
      expect(result.color).toBe('#10b981')
    })

    it('returns Excellent for score exactly 90', () => {
      expect(getApiGreenScoreDetails(90).text).toBe('Excellent')
    })

    it('returns Good for score >= 75 and < 90', () => {
      const result = getApiGreenScoreDetails(80)
      expect(result.text).toBe('Good')
      expect(result.color).toBe('#84cc16')
    })

    it('returns Needs Improvement for score >= 50 and < 75', () => {
      const result = getApiGreenScoreDetails(60)
      expect(result.text).toBe('Needs Improvement')
      expect(result.color).toBe('#f59e0b')
    })

    it('returns Poor for score < 50', () => {
      const result = getApiGreenScoreDetails(30)
      expect(result.text).toBe('Poor')
      expect(result.color).toBe('#ef4444')
    })
  })

  // ==========================================================================
  // getEroomScoreDetails
  // ==========================================================================

  describe('getEroomScoreDetails', () => {
    it('delegates to getScoreInterpretation for low score', () => {
      const result = getEroomScoreDetails(20)
      expect(result.text).toBe('Mature')
      expect(result.color).toBe('#10b981')
    })

    it('returns High for score > 75', () => {
      const result = getEroomScoreDetails(80)
      expect(result.text).toBe('High')
    })

    it('shadow uses 33 hex opacity', () => {
      const result = getEroomScoreDetails(20)
      expect(result.shadow).toContain('33')
    })
  })

  // ==========================================================================
  // getScoreDetailsByType
  // ==========================================================================

  describe('getScoreDetailsByType', () => {
    it('dispatches to EROOM for EvaluationType.EROOM', () => {
      const result = getScoreDetailsByType(20, EvaluationType.EROOM)
      expect(result.text).toBe('Mature')
    })

    it('dispatches to API Green Score for EvaluationType.API_GREEN_SCORE', () => {
      const result = getScoreDetailsByType(95, EvaluationType.API_GREEN_SCORE)
      expect(result.text).toBe('Excellent')
    })
  })

  // ==========================================================================
  // prepareApiGreenScoreChartData
  // ==========================================================================

  describe('prepareApiGreenScoreChartData', () => {
    const questions = [
      { id: 'q1', section: 'Architecture', question: 'Q1', description: 'D1', points: 100 },
      { id: 'q2', section: 'Design', question: 'Q2', description: 'D2', points: 100 }
    ]

    it('returns sections with correct scores', () => {
      const result = prepareApiGreenScoreChartData({ q1: true, q2: false }, questions)
      expect(result).toHaveLength(2)
      const arch = result.find(r => r.label === 'Architecture')
      expect(arch).toBeDefined()
      expect(arch!.score).toBe(100)
      const design = result.find(r => r.label === 'Design')
      expect(design).toBeDefined()
      expect(design!.score).toBe(0)
    })

    it('returns empty for no answers', () => {
      const result = prepareApiGreenScoreChartData({}, questions)
      expect(result).toHaveLength(2)
      expect(result[0].score).toBe(0)
    })
  })

  // ==========================================================================
  // prepareEroomChartData
  // ==========================================================================

  describe('prepareEroomChartData', () => {
    const categories: EroomCategory[] = [
      {
        id: '1',
        name: 'Product',
        icon: '📦',
        description: 'Product category',
        includeInScore: true,
        evaluationScaleType: 'standard',
        questions: [
          { id: 'q1', criteria: 'C1', impactLevel: 'Moderate', impactWeight: 1 }
        ]
      }
    ]

    it('returns category scores', () => {
      const answers = { q1: 'improvement_potential' as const }
      const result = prepareEroomChartData(answers, categories)
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Product')
      expect(result[0].score).toBe(100)
    })
  })

  // ==========================================================================
  // prepareChartData
  // ==========================================================================

  describe('prepareChartData', () => {
    const questions = [
      { id: 'q1', section: 'Architecture', question: 'Q1', description: 'D1', points: 100 }
    ]

    const categories: EroomCategory[] = [
      {
        id: '1',
        name: 'Product',
        icon: '📦',
        description: 'Product category',
        includeInScore: true,
        evaluationScaleType: 'standard',
        questions: [
          { id: 'eq1', criteria: 'C1', impactLevel: 'Moderate', impactWeight: 1 }
        ]
      }
    ]

    it('dispatches to API Green Score when questions provided', () => {
      const result = prepareChartData({ q1: true }, EvaluationType.API_GREEN_SCORE, questions)
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Architecture')
    })

    it('dispatches to EROOM when categories provided', () => {
      const result = prepareChartData(
        { eq1: 'improvement_potential' },
        EvaluationType.EROOM,
        undefined,
        categories
      )
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Product')
    })

    it('returns empty when no questions or categories', () => {
      const result = prepareChartData({}, EvaluationType.API_GREEN_SCORE)
      expect(result).toEqual([])
    })
  })
})
