import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Project } from '../../../src/types/project'
import type { Evaluation } from '../../../src/types/evaluation'
import { EvaluationType, EvaluationStatus } from '../../../src/types/evaluation'

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
  saveAuditProgress
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
})
