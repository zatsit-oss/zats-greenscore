import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Project } from '../../../src/types/project'
import type { Evaluation } from '../../../src/types/evaluation'
import { EvaluationType, EvaluationStatus } from '../../../src/types/evaluation'
import type { EroomCategory } from '../../../src/types/eroom'

vi.mock('../../../src/services/project-service', () => {
  let projects: Record<string, Project> = {}
  return {
    getProject: vi.fn((id: string) => projects[id]),
    saveProject: vi.fn((p: Project) => { projects[p.id] = { ...p } }),
    _reset: () => { projects = {} }
  }
})

import * as projectService from '../../../src/services/project-service'
import { getEvaluationDisplayData } from '../../../src/services/project-view-service'

const resetProjects = () => {
  (projectService as unknown as { _reset: () => void })._reset()
}

// Test fixtures ------------------------------------------------------------

const makeEvaluation = (type: EvaluationType, overrides: Partial<Evaluation> = {}): Evaluation => ({
  type,
  status: EvaluationStatus.IN_PROGRESS,
  answers: {},
  score: null,
  ranking: null,
  startedAt: '2024-01-01',
  ...overrides
})

const makeProject = (
  id: string,
  evaluations: Partial<Record<EvaluationType, Evaluation>> = {}
): Project => ({
  id,
  name: `Project ${id}`,
  description: 'Test',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  evaluations
})

const quickDiagnosisCategory: EroomCategory = {
  id: '0',
  name: 'Quick Diagnosis',
  icon: '🔍',
  description: 'Preliminary step',
  includeInScore: false,
  evaluationScaleType: 'quickDiagnosis',
  questions: [
    { id: 'qd1', criteria: 'QD1', impactLevel: 'Moderate', impactWeight: 1 },
    { id: 'qd2', criteria: 'QD2', impactLevel: 'Moderate', impactWeight: 1 }
  ]
}

const productCategory: EroomCategory = {
  id: '1',
  name: 'Product',
  icon: '📦',
  description: 'Product category',
  includeInScore: true,
  evaluationScaleType: 'standard',
  questions: [
    { id: 'p1', criteria: 'P1', impactLevel: 'Moderate', impactWeight: 1 }
  ]
}

const eroomCategories = [quickDiagnosisCategory, productCategory]

// Tests --------------------------------------------------------------------

describe('getEvaluationDisplayData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetProjects()
  })

  describe('advanced summary gating (EROOM)', () => {
    it('hides advanced score when only quick diagnosis has answers', () => {
      const evaluation = makeEvaluation(EvaluationType.EROOM, {
        answers: { qd1: 3, qd2: 4 },
        score: 0,
        preliminaryScore: 50
      })
      const project = makeProject('p1', { [EvaluationType.EROOM]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )

      expect(display.score).toBeNull()
      expect(display.scoreDetails).toBeNull()
      expect(display.scoreContext).toBeNull()
      expect(display.chartData).toEqual([])
      expect(display.preliminary?.score).toBe(50)
    })

    it('shows advanced score once at least one advanced answer exists', () => {
      const evaluation = makeEvaluation(EvaluationType.EROOM, {
        answers: { qd1: 3, p1: 'improvement_potential' },
        score: 42,
        preliminaryScore: 25
      })
      const project = makeProject('p1', { [EvaluationType.EROOM]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )

      expect(display.score).toBe(42)
      expect(display.scoreDetails).not.toBeNull()
      expect(display.scoreContext).not.toBeNull()
      expect(display.chartData.length).toBeGreaterThan(0)
    })

    it('keeps the "Advanced Diagnosis Score" title even when gated', () => {
      const evaluation = makeEvaluation(EvaluationType.EROOM, {
        answers: { qd1: 3 },
        score: 0
      })
      const project = makeProject('p1', { [EvaluationType.EROOM]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )

      expect(display.scoreTitle).toBe('Advanced Diagnosis Score')
    })
  })

  describe('advanced summary (no preliminary, API Green Score)', () => {
    const apiQuestions = [
      { id: 'q1', section: 'Architecture', question: 'Q1', description: 'D1', points: 100 }
    ]

    it('shows the score as soon as any answer exists', () => {
      const evaluation = makeEvaluation(EvaluationType.API_GREEN_SCORE, {
        answers: { q1: true },
        score: 80
      })
      const project = makeProject('p1', { [EvaluationType.API_GREEN_SCORE]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.API_GREEN_SCORE,
        apiQuestions
      )

      expect(display.score).toBe(80)
      expect(display.scoreDetails?.text).toBe('Good')
      expect(display.chartData.length).toBeGreaterThan(0)
    })

    it('uses "Current GreenScore" title (no preliminary step)', () => {
      const evaluation = makeEvaluation(EvaluationType.API_GREEN_SCORE, {
        answers: { q1: true },
        score: 80
      })
      const project = makeProject('p1', { [EvaluationType.API_GREEN_SCORE]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.API_GREEN_SCORE,
        apiQuestions
      )

      expect(display.scoreTitle).toBe('Current GreenScore')
    })
  })

  describe('preliminary display data', () => {
    it('returns null preliminary when no preliminaryScore is stored', () => {
      const evaluation = makeEvaluation(EvaluationType.EROOM, {
        answers: { p1: 'improvement_potential' },
        score: 100
      })
      const project = makeProject('p1', { [EvaluationType.EROOM]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )

      expect(display.preliminary).toBeNull()
    })

    it('builds preliminary display data from the preliminaryScore', () => {
      const evaluation = makeEvaluation(EvaluationType.EROOM, {
        answers: { qd1: 3 },
        preliminaryScore: 60
      })
      const project = makeProject('p1', { [EvaluationType.EROOM]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )

      expect(display.preliminary).not.toBeNull()
      expect(display.preliminary!.score).toBe(60)
      expect(display.preliminary!.label).toBe('Quick Diagnosis')
      expect(display.preliminary!.blocking).toBe(false)
    })
  })

  describe('status and progress', () => {
    it('reports Not Started when no evaluation exists', () => {
      const project = makeProject('p1')
      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )
      expect(display.status).toBe('Not Started')
      expect(display.isCompleted).toBe(false)
    })

    it('reports In Progress and exposes progress counter', () => {
      const evaluation = makeEvaluation(EvaluationType.EROOM, {
        answeredQuestions: 2,
        totalQuestions: 5
      })
      const project = makeProject('p1', { [EvaluationType.EROOM]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )

      expect(display.status).toBe('In Progress')
      expect(display.progress).toEqual({ answered: 2, total: 5 })
    })

    it('omits progress counter when evaluation is completed', () => {
      const evaluation = makeEvaluation(EvaluationType.EROOM, {
        status: EvaluationStatus.COMPLETED,
        answeredQuestions: 5,
        totalQuestions: 5
      })
      const project = makeProject('p1', { [EvaluationType.EROOM]: evaluation })

      const display = getEvaluationDisplayData(
        project,
        EvaluationType.EROOM,
        undefined,
        eroomCategories
      )

      expect(display.status).toBe('Completed')
      expect(display.isCompleted).toBe(true)
      expect(display.progress).toBeNull()
    })
  })
})
