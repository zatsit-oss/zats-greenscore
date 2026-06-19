import {describe, it, expect, vi, beforeEach} from 'vitest'

// Mock the storage module (project-transfer-service goes through project-service)
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
    restoreProject: vi.fn((project: Record<string, unknown>) => {
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
    _setProjects: (newProjects: Array<Record<string, unknown>>) => {
      projects = [...newProjects]
    }
  }
})

import {
  serializeProjects,
  exportAllProjects,
  parseProjectsFile,
  detectNameConflicts,
  applyImport,
  EXPORT_FORMAT,
  EXPORT_VERSION
} from '../../../src/services/project-transfer-service'
import type {Project} from '../../../src/types/project'
import {APP_VERSION} from '../../../src/types/project'
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

const setMockProjects = (p: unknown[]) => {
  (storage as unknown as { _setProjects: (p: unknown[]) => void })._setProjects(p)
}

describe('project-transfer-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockProjects([])
  })

  describe('serializeProjects', () => {
    it('wraps projects in an export envelope', () => {
      const json = serializeProjects([makeProject()])
      const parsed = JSON.parse(json)
      expect(parsed.format).toBe(EXPORT_FORMAT)
      expect(parsed.version).toBe(EXPORT_VERSION)
      expect(parsed.exportedAt).toBeTypeOf('string')
      expect(parsed.appVersion).toBe(APP_VERSION)
      expect(parsed.projects).toHaveLength(1)
      expect(parsed.projects[0].name).toBe('Test Project')
    })
  })

  describe('exportAllProjects', () => {
    it('serializes all stored projects', () => {
      setMockProjects([makeProject({id: 'a'}), makeProject({id: 'b', name: 'B'})])
      const parsed = JSON.parse(exportAllProjects())
      expect(parsed.projects).toHaveLength(2)
      expect(storage.getAllProjects).toHaveBeenCalled()
    })
  })

  describe('parseProjectsFile', () => {
    it('parses a valid export envelope', () => {
      const json = serializeProjects([makeProject()])
      const result = parseProjectsFile(json)
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.projects).toHaveLength(1)
    })

    it('parses a bare array of projects', () => {
      const json = JSON.stringify([makeProject()])
      const result = parseProjectsFile(json)
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.projects).toHaveLength(1)
    })

    it('rejects empty content', () => {
      const result = parseProjectsFile('   ')
      expect(result.ok).toBe(false)
    })

    it('rejects invalid JSON', () => {
      const result = parseProjectsFile('{ not json')
      expect(result.ok).toBe(false)
    })

    it('rejects an unrecognized object shape', () => {
      const result = parseProjectsFile(JSON.stringify({foo: 'bar'}))
      expect(result.ok).toBe(false)
    })

    it('rejects when no valid project is present', () => {
      const result = parseProjectsFile(JSON.stringify([{id: 'x'}]))
      expect(result.ok).toBe(false)
    })

    it('filters out malformed entries but keeps valid ones', () => {
      const json = JSON.stringify([makeProject(), {id: 'broken'}])
      const result = parseProjectsFile(json)
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.projects).toHaveLength(1)
    })
  })

  describe('detectNameConflicts', () => {
    it('returns names present in both lists', () => {
      const existing = [makeProject({id: 'e1', name: 'Alpha'})]
      const imported = [
        makeProject({id: 'i1', name: 'Alpha'}),
        makeProject({id: 'i2', name: 'Beta'})
      ]
      expect(detectNameConflicts(imported, existing)).toEqual(['Alpha'])
    })

    it('returns empty when no conflicts', () => {
      const existing = [makeProject({name: 'Alpha'})]
      const imported = [makeProject({name: 'Beta'})]
      expect(detectNameConflicts(imported, existing)).toEqual([])
    })

    it('deduplicates repeated conflicting names', () => {
      const existing = [makeProject({name: 'Alpha'})]
      const imported = [
        makeProject({id: 'i1', name: 'Alpha'}),
        makeProject({id: 'i2', name: 'Alpha'})
      ]
      expect(detectNameConflicts(imported, existing)).toEqual(['Alpha'])
    })
  })

  describe('export then re-import (round trip)', () => {
    it('detects name collisions when re-importing a previously exported file', () => {
      const projects = [
        makeProject({id: 'a', name: 'Alpha'}),
        makeProject({id: 'b', name: 'Beta'})
      ]
      setMockProjects(projects)

      // Export the current projects, then parse the exact same payload back.
      const exported = exportAllProjects()
      const parsed = parseProjectsFile(exported)
      expect(parsed.ok).toBe(true)
      if (!parsed.ok) return

      const conflicts = detectNameConflicts(parsed.projects, storage.getAllProjects())
      expect(conflicts.sort()).toEqual(['Alpha', 'Beta'])
    })

    it('skips everything (no duplicates) when re-importing without overwrite', () => {
      const projects = [
        makeProject({id: 'a', name: 'Alpha'}),
        makeProject({id: 'b', name: 'Beta'})
      ]
      setMockProjects(projects)

      const parsed = parseProjectsFile(exportAllProjects())
      if (!parsed.ok) throw new Error('export should be re-importable')

      const summary = applyImport(parsed.projects, false)
      expect(summary).toEqual({added: 0, overwritten: 0, skipped: 2})
      // Crucially: re-importing must not create duplicate projects.
      expect(storage.getAllProjects()).toHaveLength(2)
    })

    it('overwrites in place (no duplicates) when re-importing with overwrite', () => {
      const projects = [
        makeProject({id: 'a', name: 'Alpha'}),
        makeProject({id: 'b', name: 'Beta'})
      ]
      setMockProjects(projects)

      const parsed = parseProjectsFile(exportAllProjects())
      if (!parsed.ok) throw new Error('export should be re-importable')

      const summary = applyImport(parsed.projects, true)
      expect(summary).toEqual({added: 0, overwritten: 2, skipped: 0})
      expect(storage.getAllProjects()).toHaveLength(2)
    })

    it('preserves original timestamps on import (does not bump updatedAt)', () => {
      const imported = [
        makeProject({id: 'a', name: 'Alpha', createdAt: '2024-01-01', updatedAt: '2024-03-15'})
      ]
      // Existing project with the same name but different dates.
      setMockProjects([
        makeProject({id: 'existing-a', name: 'Alpha', createdAt: '2020-01-01', updatedAt: '2020-01-01'})
      ])

      applyImport(imported, true)

      const restored = storage.getAllProjects()[0] as unknown as Project
      expect(restored.createdAt).toBe('2024-01-01')
      expect(restored.updatedAt).toBe('2024-03-15')
    })
  })

  describe('applyImport', () => {
    it('adds projects with new names', () => {
      const summary = applyImport([makeProject({id: 'new1', name: 'Fresh'})], false)
      expect(summary).toEqual({added: 1, overwritten: 0, skipped: 0})
      expect(storage.getAllProjects()).toHaveLength(1)
    })

    it('overwrites in place when overwrite is true (keeps existing id)', () => {
      setMockProjects([makeProject({id: 'existing-id', name: 'Alpha', description: 'old'})])
      const summary = applyImport(
        [makeProject({id: 'imported-id', name: 'Alpha', description: 'new'})],
        true
      )
      expect(summary).toEqual({added: 0, overwritten: 1, skipped: 0})
      const all = storage.getAllProjects()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe('existing-id')
      expect(all[0].description).toBe('new')
    })

    it('skips conflicting projects when overwrite is false', () => {
      setMockProjects([makeProject({id: 'existing-id', name: 'Alpha', description: 'old'})])
      const summary = applyImport(
        [makeProject({id: 'imported-id', name: 'Alpha', description: 'new'})],
        false
      )
      expect(summary).toEqual({added: 0, overwritten: 0, skipped: 1})
      const all = storage.getAllProjects()
      expect(all).toHaveLength(1)
      expect(all[0].description).toBe('old')
    })

    it('assigns a new id when an imported id collides with an unrelated project', () => {
      setMockProjects([makeProject({id: 'shared-id', name: 'Existing'})])
      const summary = applyImport([makeProject({id: 'shared-id', name: 'Imported'})], false)
      expect(summary).toEqual({added: 1, overwritten: 0, skipped: 0})
      const all = storage.getAllProjects()
      expect(all).toHaveLength(2)
      const ids = all.map(p => p.id)
      expect(new Set(ids).size).toBe(2)
    })
  })
})
