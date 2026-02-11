import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the storage module
vi.mock('../../../src/utils/storage', () => {
  let projects: Array<Record<string, unknown>> = []

  return {
    getAllProjects: vi.fn(() => projects),
    getProjectById: vi.fn((id: string) => projects.find(p => p.id === id)),
    saveProject: vi.fn((project: Record<string, unknown>) => {
      const index = projects.findIndex(p => p.id === project.id)
      if (index >= 0) {
        projects[index] = project
      } else {
        projects.push(project)
      }
    }),
    deleteProject: vi.fn((id: string) => {
      projects = projects.filter(p => p.id !== id)
    }),
    migrateStorageIfNeeded: vi.fn(),
    // Helper to reset state between tests
    _setProjects: (newProjects: Array<Record<string, unknown>>) => {
      projects = [...newProjects]
    }
  }
})

import {
  getProject,
  saveProject,
  deleteProject,
  getAllProjects,
  updateProjectEvaluation,
  ensureStorageMigrated
} from '../../../src/services/project-service'
import { EvaluationType, EvaluationStatus } from '../../../src/types/evaluation'
import type { Project } from '../../../src/types/project'
import type { Evaluation } from '../../../src/types/evaluation'
import * as storage from '../../../src/utils/storage'

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj1',
  name: 'Test Project',
  description: 'Test',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  evaluations: {},
  ...overrides
})

describe('project-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset projects state in mock
    ;(storage as unknown as { _setProjects: (p: unknown[]) => void })._setProjects([])
  })

  describe('ensureStorageMigrated', () => {
    it('calls storage migration', () => {
      ensureStorageMigrated()
      expect(storage.migrateStorageIfNeeded).toHaveBeenCalledOnce()
    })
  })

  describe('getAllProjects', () => {
    it('delegates to storage', () => {
      ;(storage as unknown as { _setProjects: (p: unknown[]) => void })._setProjects([makeProject()])
      const result = getAllProjects()
      expect(result).toHaveLength(1)
      expect(storage.getAllProjects).toHaveBeenCalled()
    })
  })

  describe('getProject', () => {
    it('returns project by id', () => {
      ;(storage as unknown as { _setProjects: (p: unknown[]) => void })._setProjects([makeProject({ id: 'abc' })])
      const result = getProject('abc')
      expect(result).toBeDefined()
      expect(result!.id).toBe('abc')
    })

    it('returns undefined for nonexistent id', () => {
      const result = getProject('nonexistent')
      expect(result).toBeUndefined()
    })
  })

  describe('saveProject', () => {
    it('delegates save to storage', () => {
      const project = makeProject()
      saveProject(project)
      expect(storage.saveProject).toHaveBeenCalledWith(project)
    })
  })

  describe('deleteProject', () => {
    it('returns true when project exists', () => {
      ;(storage as unknown as { _setProjects: (p: unknown[]) => void })._setProjects([makeProject({ id: 'del1' })])
      const result = deleteProject('del1')
      expect(result).toBe(true)
      expect(storage.deleteProject).toHaveBeenCalledWith('del1')
    })

    it('returns false when project does not exist', () => {
      const result = deleteProject('nonexistent')
      expect(result).toBe(false)
      expect(storage.deleteProject).not.toHaveBeenCalled()
    })
  })

  describe('updateProjectEvaluation', () => {
    it('updates evaluation and saves', () => {
      const project = makeProject({
        id: 'eval1',
        evaluations: {
          [EvaluationType.API_GREEN_SCORE]: {
            type: EvaluationType.API_GREEN_SCORE,
            status: EvaluationStatus.IN_PROGRESS,
            answers: {},
            score: null,
            ranking: null,
            startedAt: '2024-01-01'
          }
        }
      })
      ;(storage as unknown as { _setProjects: (p: unknown[]) => void })._setProjects([project])

      const newEval: Evaluation = {
        type: EvaluationType.API_GREEN_SCORE,
        status: EvaluationStatus.COMPLETED,
        answers: { q1: true },
        score: 85,
        ranking: null,
        startedAt: '2024-01-01',
        completedAt: '2024-01-02'
      }

      const result = updateProjectEvaluation('eval1', newEval)
      expect(result).toBe(true)
      expect(storage.saveProject).toHaveBeenCalled()
    })

    it('returns false when project not found', () => {
      const newEval: Evaluation = {
        type: EvaluationType.API_GREEN_SCORE,
        status: EvaluationStatus.COMPLETED,
        answers: {},
        score: 50,
        ranking: null,
        startedAt: '2024-01-01'
      }

      const result = updateProjectEvaluation('nonexistent', newEval)
      expect(result).toBe(false)
      expect(storage.saveProject).not.toHaveBeenCalled()
    })
  })
})
