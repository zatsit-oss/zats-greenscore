import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Project } from '../../../src/types/project'
import type { Evaluation } from '../../../src/types/evaluation'
import { EvaluationType, EvaluationStatus } from '../../../src/types/evaluation'
import { ProjectRanking } from '../../../src/types/common'
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
  loadAuditData,
  saveAuditProgress,
  finalizeApiGreenScoreEvaluation,
  finalizeEroomEvaluation,
  saveEroomProgressiveScore
} from '../../../src/services/audit-service'

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

describe('audit-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetProjects()
  })

  // ==========================================================================
  // loadAuditData
  // ==========================================================================

  describe('loadAuditData', () => {
    it('returns null when project does not exist', () => {
      expect(loadAuditData('nonexistent', EvaluationType.API_GREEN_SCORE)).toBeNull()
    })

    it('returns null when evaluation is missing', () => {
      setProjects({ '1': makeProject('1') })
      expect(loadAuditData('1', EvaluationType.API_GREEN_SCORE)).toBeNull()
    })

    it('returns project and evaluation on success', () => {
      const eval1 = makeEvaluation(EvaluationType.API_GREEN_SCORE)
      setProjects({ '1': makeProject('1', { [EvaluationType.API_GREEN_SCORE]: eval1 }) })

      const result = loadAuditData('1', EvaluationType.API_GREEN_SCORE)
      expect(result).not.toBeNull()
      expect(result!.project.id).toBe('1')
      expect(result!.evaluation.type).toBe(EvaluationType.API_GREEN_SCORE)
    })
  })

  // ==========================================================================
  // saveAuditProgress
  // ==========================================================================

  describe('saveAuditProgress', () => {
    it('returns false when project does not exist', () => {
      expect(saveAuditProgress('nonexistent', EvaluationType.API_GREEN_SCORE, {})).toBe(false)
    })

    it('returns false when evaluation is missing', () => {
      setProjects({ '1': makeProject('1') })
      expect(saveAuditProgress('1', EvaluationType.API_GREEN_SCORE, {})).toBe(false)
    })

    it('saves answers and returns true', () => {
      const eval1 = makeEvaluation(EvaluationType.API_GREEN_SCORE)
      setProjects({ '1': makeProject('1', { [EvaluationType.API_GREEN_SCORE]: eval1 }) })

      const answers = { q1: true, q2: false }
      expect(saveAuditProgress('1', EvaluationType.API_GREEN_SCORE, answers)).toBe(true)
      expect(projectService.saveProject).toHaveBeenCalled()
    })

    it('saves progress info when provided', () => {
      const eval1 = makeEvaluation(EvaluationType.API_GREEN_SCORE)
      setProjects({ '1': makeProject('1', { [EvaluationType.API_GREEN_SCORE]: eval1 }) })

      const answers = { q1: true }
      const result = saveAuditProgress('1', EvaluationType.API_GREEN_SCORE, answers, {
        answeredQuestions: 1,
        totalQuestions: 10
      })
      expect(result).toBe(true)

      const savedProject = (projectService.saveProject as ReturnType<typeof vi.fn>).mock.calls[0][0] as Project
      const savedEval = savedProject.evaluations[EvaluationType.API_GREEN_SCORE]!
      expect(savedEval.answeredQuestions).toBe(1)
      expect(savedEval.totalQuestions).toBe(10)
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
