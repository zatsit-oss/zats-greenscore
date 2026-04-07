import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Project } from '../../../src/types/project'
import type { Evaluation } from '../../../src/types/evaluation'
import { EvaluationType, EvaluationStatus } from '../../../src/types/evaluation'
import type { EroomCategory } from '../../../src/types/eroom'

// Mock project-service
vi.mock('../../../src/services/project-service', () => {
  let projects: Record<string, Project> = {}
  return {
    getProject: vi.fn((id: string) => projects[id] || undefined),
    saveProject: vi.fn((p: Project) => { projects[p.id] = { ...p } }),
    _setProjects: (p: Record<string, Project>) => { projects = { ...p } },
    _reset: () => { projects = {} }
  }
})

import * as projectService from '../../../src/services/project-service'
import {
  getApiGreenScoreDetails,
  getEroomScoreDetails,
  getScoreDetailsByType,
  prepareApiGreenScoreChartData,
  prepareEroomChartData,
  prepareChartData,
  finalizeApiGreenScoreEvaluation,
  finalizeEroomEvaluation,
  saveEroomProgressiveScore
} from '../../../src/services/evaluation-service'

const setProjects = (p: Record<string, Project>) => {
  (projectService as unknown as { _setProjects: (p: Record<string, Project>) => void })._setProjects(p)
}

const resetProjects = () => {
  (projectService as unknown as { _reset: () => void })._reset()
}

const makeEvaluation = (type: EvaluationType, overrides: Partial<Evaluation> = {}): Evaluation => ({
  type,
  status: EvaluationStatus.IN_PROGRESS,
  answers: {},
  score: null,
  ranking: null,
  startedAt: '2024-01-01',
  ...overrides
})

const makeProject = (id: string, evaluations: Partial<Record<EvaluationType, Evaluation>> = {}): Project => ({
  id,
  name: `Project ${id}`,
  description: 'Test',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  evaluations
})

// Simple EROOM categories for testing
const makeScoredCategory = (id: string, questionIds: string[]): EroomCategory => ({
  id,
  name: `Category ${id}`,
  icon: '📋',
  description: 'Test category',
  includeInScore: true,
  evaluationScaleType: 'standard',
  questions: questionIds.map(qId => ({
    id: qId,
    criteria: `Criteria ${qId}`,
    impactLevel: 'Moderate' as const,
    impactWeight: 1
  }))
})

const makeQuickDiagnosisCategory = (questionIds: string[]): EroomCategory => ({
  id: '0',
  name: 'Quick Diagnosis',
  icon: '🔍',
  description: 'Quick Diagnosis',
  includeInScore: false,
  evaluationScaleType: 'quickDiagnosis',
  questions: questionIds.map(qId => ({
    id: qId,
    criteria: `Criteria ${qId}`,
    impactLevel: 'Moderate' as const,
    impactWeight: 1
  }))
})

describe('evaluation-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetProjects()
  })

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

  // ==========================================================================
  // finalizeApiGreenScoreEvaluation
  // ==========================================================================

  describe('finalizeApiGreenScoreEvaluation', () => {
    const questions = [
      { id: 'q1', section: 'Architecture', question: 'Q1', description: 'D1', points: 100 },
      { id: 'q2', section: 'Architecture', question: 'Q2', description: 'D2', points: 100 }
    ]

    it('returns failure when project does not exist', () => {
      const result = finalizeApiGreenScoreEvaluation('nonexistent', { q1: true }, questions)
      expect(result.success).toBe(false)
    })

    it('returns failure when evaluation is missing', () => {
      setProjects({ '1': makeProject('1') })
      const result = finalizeApiGreenScoreEvaluation('1', { q1: true }, questions)
      expect(result.success).toBe(false)
    })

    it('calculates score and marks as COMPLETED', () => {
      const eval1 = makeEvaluation(EvaluationType.API_GREEN_SCORE)
      setProjects({ '1': makeProject('1', { [EvaluationType.API_GREEN_SCORE]: eval1 }) })

      const result = finalizeApiGreenScoreEvaluation('1', { q1: true, q2: true }, questions)
      expect(result.success).toBe(true)
      expect(result.score).toBe(100)
      expect(result.message).toContain('100/100')

      const savedProject = (projectService.saveProject as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project
      expect(savedProject.evaluations[EvaluationType.API_GREEN_SCORE]!.status).toBe(EvaluationStatus.COMPLETED)
    })

    it('calculates partial score correctly', () => {
      const eval1 = makeEvaluation(EvaluationType.API_GREEN_SCORE)
      setProjects({ '1': makeProject('1', { [EvaluationType.API_GREEN_SCORE]: eval1 }) })

      const result = finalizeApiGreenScoreEvaluation('1', { q1: true, q2: false }, questions)
      expect(result.success).toBe(true)
      expect(result.score).toBe(50)
    })
  })

  // ==========================================================================
  // finalizeEroomEvaluation
  // ==========================================================================

  describe('finalizeEroomEvaluation', () => {
    const scoredCat = makeScoredCategory('1', ['q1', 'q2'])
    const quickDiag = makeQuickDiagnosisCategory(['qd1'])
    const allCategories = [quickDiag, scoredCat]
    const scoredCategories = [scoredCat]

    it('returns failure when project does not exist', () => {
      const result = finalizeEroomEvaluation('nonexistent', {}, allCategories, scoredCategories)
      expect(result.success).toBe(false)
    })

    it('marks COMPLETED when all scored questions are answered', () => {
      const eval1 = makeEvaluation(EvaluationType.EROOM)
      setProjects({ '1': makeProject('1', { [EvaluationType.EROOM]: eval1 }) })

      const answers = { q1: 'strength_confirmed' as const, q2: 'improvement_potential' as const }
      const result = finalizeEroomEvaluation('1', answers, allCategories, scoredCategories)

      expect(result.success).toBe(true)
      expect(result.isComplete).toBe(true)

      const savedProject = (projectService.saveProject as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project
      expect(savedProject.evaluations[EvaluationType.EROOM]!.status).toBe(EvaluationStatus.COMPLETED)
    })

    it('stays IN_PROGRESS when questions are unanswered', () => {
      const eval1 = makeEvaluation(EvaluationType.EROOM)
      setProjects({ '1': makeProject('1', { [EvaluationType.EROOM]: eval1 }) })

      const answers = { q1: 'strength_confirmed' as const, q2: 'to_evaluate' as const }
      const result = finalizeEroomEvaluation('1', answers, allCategories, scoredCategories)

      expect(result.success).toBe(true)
      expect(result.isComplete).toBe(false)
      expect(result.message).toContain('remaining')

      const savedProject = (projectService.saveProject as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project
      expect(savedProject.evaluations[EvaluationType.EROOM]!.status).toBe(EvaluationStatus.IN_PROGRESS)
    })
  })

  // ==========================================================================
  // saveEroomProgressiveScore
  // ==========================================================================

  describe('saveEroomProgressiveScore', () => {
    const scoredCat = makeScoredCategory('1', ['q1', 'q2'])
    const quickDiag = makeQuickDiagnosisCategory(['qd1'])
    const allCategories = [quickDiag, scoredCat]
    const scoredCategories = [scoredCat]

    it('returns false when project does not exist', () => {
      expect(saveEroomProgressiveScore('nonexistent', EvaluationType.EROOM, {}, allCategories, scoredCategories)).toBe(false)
    })

    it('calculates progressive score and saves', () => {
      const eval1 = makeEvaluation(EvaluationType.EROOM)
      setProjects({ '1': makeProject('1', { [EvaluationType.EROOM]: eval1 }) })

      const answers = { q1: 'improvement_potential' as const, q2: 'strength_confirmed' as const }
      const result = saveEroomProgressiveScore('1', EvaluationType.EROOM, answers, allCategories, scoredCategories)

      expect(result).toBe(true)
      expect(projectService.saveProject).toHaveBeenCalled()

      const savedProject = (projectService.saveProject as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project
      const savedEval = savedProject.evaluations[EvaluationType.EROOM]!
      expect(savedEval.score).toBeTypeOf('number')
      expect(savedEval.ranking).toBeTruthy()
      expect(savedEval.answeredQuestions).toBe(2)
      expect(savedEval.totalQuestions).toBe(2)
    })
  })
})
