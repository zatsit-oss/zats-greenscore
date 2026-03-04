import { describe, it, expect } from 'vitest'
import {
  hasCompletedEvaluation,
  hasEvaluationType,
  getHighestScore,
  getBestRanking,
  createProject
} from '../../../src/types/project'
import { ProjectRanking } from '../../../src/types/common'
import { EvaluationType, EvaluationStatus } from '../../../src/types/evaluation'
import type { Project } from '../../../src/types/project'
import type { Evaluation } from '../../../src/types/evaluation'

// ============================================================================
// TEST FIXTURES
// ============================================================================

const makeEval = (overrides: Partial<Evaluation> = {}): Evaluation => ({
  type: EvaluationType.API_GREEN_SCORE,
  status: EvaluationStatus.IN_PROGRESS,
  answers: {},
  score: null,
  ranking: null,
  startedAt: '2024-01-01',
  ...overrides
})

const makeProject = (evaluations: Partial<Record<EvaluationType, Evaluation>> = {}): Project => ({
  id: 'p1',
  name: 'Test',
  description: 'Test',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  evaluations
})

// ============================================================================
// hasCompletedEvaluation
// ============================================================================

describe('hasCompletedEvaluation', () => {
  it('returns false when no evaluations', () => {
    expect(hasCompletedEvaluation(makeProject())).toBe(false)
  })

  it('returns false when all in progress', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ status: EvaluationStatus.IN_PROGRESS })
    })
    expect(hasCompletedEvaluation(project)).toBe(false)
  })

  it('returns true when at least one is completed', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ status: EvaluationStatus.IN_PROGRESS }),
      [EvaluationType.EROOM]: makeEval({ type: EvaluationType.EROOM, status: EvaluationStatus.COMPLETED })
    })
    expect(hasCompletedEvaluation(project)).toBe(true)
  })
})

// ============================================================================
// hasEvaluationType
// ============================================================================

describe('hasEvaluationType', () => {
  it('returns true when type exists', () => {
    const project = makeProject({
      [EvaluationType.EROOM]: makeEval({ type: EvaluationType.EROOM })
    })
    expect(hasEvaluationType(project, EvaluationType.EROOM)).toBe(true)
  })

  it('returns false when type does not exist', () => {
    const project = makeProject({
      [EvaluationType.EROOM]: makeEval({ type: EvaluationType.EROOM })
    })
    expect(hasEvaluationType(project, EvaluationType.API_GREEN_SCORE)).toBe(false)
  })

  it('returns false when no evaluations', () => {
    expect(hasEvaluationType(makeProject(), EvaluationType.API_GREEN_SCORE)).toBe(false)
  })
})

// ============================================================================
// getHighestScore
// ============================================================================

describe('getHighestScore', () => {
  it('returns null when no evaluations', () => {
    expect(getHighestScore(makeProject())).toBeNull()
  })

  it('returns null when no completed evaluations', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ score: 50 }) // IN_PROGRESS
    })
    expect(getHighestScore(project)).toBeNull()
  })

  it('returns score of single completed evaluation', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ status: EvaluationStatus.COMPLETED, score: 75 })
    })
    expect(getHighestScore(project)).toBe(75)
  })

  it('returns highest score from multiple completed evaluations', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ status: EvaluationStatus.COMPLETED, score: 60 }),
      [EvaluationType.EROOM]: makeEval({ type: EvaluationType.EROOM, status: EvaluationStatus.COMPLETED, score: 85 })
    })
    expect(getHighestScore(project)).toBe(85)
  })

  it('ignores in-progress evaluations', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ status: EvaluationStatus.COMPLETED, score: 60 }),
      [EvaluationType.EROOM]: makeEval({ type: EvaluationType.EROOM, status: EvaluationStatus.IN_PROGRESS, score: 90 })
    })
    expect(getHighestScore(project)).toBe(60)
  })
})

// ============================================================================
// getBestRanking
// ============================================================================

describe('getBestRanking', () => {
  it('returns null when no evaluations', () => {
    expect(getBestRanking(makeProject())).toBeNull()
  })

  it('returns null when no completed evaluations', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ ranking: ProjectRanking.A })
    })
    expect(getBestRanking(project)).toBeNull()
  })

  it('returns ranking of single completed evaluation', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ status: EvaluationStatus.COMPLETED, ranking: ProjectRanking.B })
    })
    expect(getBestRanking(project)).toBe(ProjectRanking.B)
  })

  it('returns best (A > B > C > D > E) ranking', () => {
    const project = makeProject({
      [EvaluationType.API_GREEN_SCORE]: makeEval({ status: EvaluationStatus.COMPLETED, ranking: ProjectRanking.C }),
      [EvaluationType.EROOM]: makeEval({ type: EvaluationType.EROOM, status: EvaluationStatus.COMPLETED, ranking: ProjectRanking.A })
    })
    expect(getBestRanking(project)).toBe(ProjectRanking.A)
  })
})

// ============================================================================
// createProject
// ============================================================================

describe('createProject', () => {
  it('creates a project with correct structure', () => {
    const project = createProject('My API', 'A test API')
    expect(project.name).toBe('My API')
    expect(project.description).toBe('A test API')
    expect(project.id).toBeDefined()
    expect(project.evaluations).toEqual({})
    expect(project.createdAt).toBeDefined()
    expect(project.updatedAt).toBeDefined()
    expect(project.appVersion).toBeDefined()
  })

  it('uses crypto.randomUUID for id', () => {
    const project = createProject('Test', 'Test')
    // Our mock returns a fixed UUID
    expect(project.id).toBe('00000000-0000-0000-0000-000000000001')
  })
})
