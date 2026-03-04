import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Project } from '../../../src/types/project'
import { EvaluationType, EvaluationStatus } from '../../../src/types/evaluation'
import type { Evaluation } from '../../../src/types/evaluation'

// Mock project-service module
vi.mock('../../../src/services/project-service', () => {
  let projects: Project[] = []
  return {
    getAllProjects: vi.fn(() => projects),
    _setProjects: (p: Project[]) => { projects = [...p] }
  }
})

import {
  getDashboardStats,
  getProjectsWithEvaluation,
  getAllProjectsWithAnyEvaluation,
  getChartData
} from '../../../src/services/dashboard'
import * as projectService from '../../../src/services/project-service'

const setProjects = (p: Project[]) => {
  (projectService as unknown as { _setProjects: (p: Project[]) => void })._setProjects(p)
}

const makeEvaluation = (overrides: Partial<Evaluation> = {}): Evaluation => ({
  type: EvaluationType.API_GREEN_SCORE,
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

describe('dashboard service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setProjects([])
  })

  // ============================================================================
  // getDashboardStats
  // ============================================================================

  describe('getDashboardStats', () => {
    it('returns zeros when no projects', () => {
      const stats = getDashboardStats(EvaluationType.API_GREEN_SCORE)
      expect(stats.totalProjects).toBe(0)
      expect(stats.completedProjects).toBe(0)
      expect(stats.avgScore).toBe(0)
      expect(stats.isAverageScoreMeaningful).toBe(true)
    })

    it('counts projects with specific evaluation type', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.COMPLETED, score: 80 }) }),
        makeProject('2', { [EvaluationType.EROOM]: makeEvaluation({ type: EvaluationType.EROOM }) }),
        makeProject('3', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation() })
      ])

      const stats = getDashboardStats(EvaluationType.API_GREEN_SCORE)
      expect(stats.totalProjects).toBe(2)
      expect(stats.completedProjects).toBe(1)
      expect(stats.avgScore).toBe(80)
    })

    it('returns null avgScore when evalType is null', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.COMPLETED, score: 80 }) })
      ])

      const stats = getDashboardStats(null)
      expect(stats.avgScore).toBeNull()
      expect(stats.isAverageScoreMeaningful).toBe(false)
    })

    it('calculates average of completed project scores', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.COMPLETED, score: 60 }) }),
        makeProject('2', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.COMPLETED, score: 80 }) }),
        makeProject('3', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.IN_PROGRESS }) })
      ])

      const stats = getDashboardStats(EvaluationType.API_GREEN_SCORE)
      expect(stats.avgScore).toBe(70) // (60+80)/2
      expect(stats.completedProjects).toBe(2)
      expect(stats.totalProjects).toBe(3)
    })
  })

  // ============================================================================
  // getProjectsWithEvaluation
  // ============================================================================

  describe('getProjectsWithEvaluation', () => {
    it('returns empty for no matching projects', () => {
      setProjects([
        makeProject('1', { [EvaluationType.EROOM]: makeEvaluation({ type: EvaluationType.EROOM }) })
      ])

      const result = getProjectsWithEvaluation(EvaluationType.API_GREEN_SCORE)
      expect(result).toHaveLength(0)
    })

    it('returns projects with matching evaluation', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation() }),
        makeProject('2', { [EvaluationType.EROOM]: makeEvaluation({ type: EvaluationType.EROOM }) })
      ])

      const result = getProjectsWithEvaluation(EvaluationType.API_GREEN_SCORE)
      expect(result).toHaveLength(1)
      expect(result[0].project.id).toBe('1')
      expect(result[0].evaluationType).toBe(EvaluationType.API_GREEN_SCORE)
    })

    it('includes allEvaluations summary', () => {
      setProjects([
        makeProject('1', {
          [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.COMPLETED, score: 85 }),
          [EvaluationType.EROOM]: makeEvaluation({ type: EvaluationType.EROOM, score: 40 })
        })
      ])

      const result = getProjectsWithEvaluation(EvaluationType.API_GREEN_SCORE)
      expect(result[0].allEvaluations).toHaveLength(2)
    })
  })

  // ============================================================================
  // getAllProjectsWithAnyEvaluation
  // ============================================================================

  describe('getAllProjectsWithAnyEvaluation', () => {
    it('returns empty when no projects have evaluations', () => {
      setProjects([makeProject('1')])
      const result = getAllProjectsWithAnyEvaluation()
      expect(result).toHaveLength(0)
    })

    it('returns all projects with at least one evaluation', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation() }),
        makeProject('2', { [EvaluationType.EROOM]: makeEvaluation({ type: EvaluationType.EROOM }) }),
        makeProject('3')
      ])

      const result = getAllProjectsWithAnyEvaluation()
      expect(result).toHaveLength(2)
    })
  })

  // ============================================================================
  // getChartData
  // ============================================================================

  describe('getChartData', () => {
    it('returns empty when evalType is null', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.COMPLETED, score: 80 }) })
      ])

      const result = getChartData(null)
      expect(result).toEqual([])
    })

    it('returns data for completed projects', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.COMPLETED, score: 80 }) }),
        makeProject('2', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation({ status: EvaluationStatus.IN_PROGRESS }) })
      ])

      const result = getChartData(EvaluationType.API_GREEN_SCORE)
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Project 1')
      expect(result[0].value).toBe(80)
    })

    it('returns empty when no completed projects', () => {
      setProjects([
        makeProject('1', { [EvaluationType.API_GREEN_SCORE]: makeEvaluation() })
      ])

      const result = getChartData(EvaluationType.API_GREEN_SCORE)
      expect(result).toHaveLength(0)
    })
  })
})
