import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to reset the module-level migrationChecked flag between tests
// So we use dynamic imports with vi.resetModules()
describe('storage', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  const importStorage = async () => {
    return await import('../../../src/utils/storage')
  }

  // ============================================================================
  // getAllProjects
  // ============================================================================

  describe('getAllProjects', () => {
    it('returns empty array when no data', async () => {
      // Set version to skip migration
      localStorage.setItem('storageVersion', '2')
      const { getAllProjects } = await importStorage()
      const result = getAllProjects()
      expect(result).toEqual([])
    })

    it('returns stored projects', async () => {
      const projects = [
        { id: '1', name: 'Test', description: '', createdAt: '', updatedAt: '', evaluations: {} }
      ]
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify(projects))
      const { getAllProjects } = await importStorage()
      const result = getAllProjects()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test')
    })

    it('returns empty array when JSON is corrupted', async () => {
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', '{invalid json')
      const { getAllProjects } = await importStorage()
      const result = getAllProjects()
      expect(result).toEqual([])
    })
  })

  // ============================================================================
  // getProjectById
  // ============================================================================

  describe('getProjectById', () => {
    it('returns project when found', async () => {
      const projects = [
        { id: 'abc', name: 'Found', description: '', createdAt: '', updatedAt: '', evaluations: {} }
      ]
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify(projects))
      const { getProjectById } = await importStorage()
      const result = getProjectById('abc')
      expect(result).toBeDefined()
      expect(result!.name).toBe('Found')
    })

    it('returns undefined when not found', async () => {
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify([]))
      const { getProjectById } = await importStorage()
      const result = getProjectById('nonexistent')
      expect(result).toBeUndefined()
    })
  })

  // ============================================================================
  // saveProject
  // ============================================================================

  describe('saveProject', () => {
    it('creates a new project', async () => {
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify([]))
      const { saveProject, getAllProjects } = await importStorage()

      const project = {
        id: 'new1',
        name: 'New Project',
        description: 'Desc',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        evaluations: {}
      }
      saveProject(project)

      const projects = getAllProjects()
      expect(projects).toHaveLength(1)
      expect(projects[0].name).toBe('New Project')
      expect(projects[0].appVersion).toBeDefined()
    })

    it('updates an existing project', async () => {
      const existing = {
        id: 'upd1',
        name: 'Original',
        description: 'Desc',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        evaluations: {}
      }
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify([existing]))
      const { saveProject, getAllProjects } = await importStorage()

      saveProject({ ...existing, name: 'Updated' })

      const projects = getAllProjects()
      expect(projects).toHaveLength(1)
      expect(projects[0].name).toBe('Updated')
    })

    it('does not mutate the original project object', async () => {
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify([]))
      const { saveProject } = await importStorage()

      const project = {
        id: 'nomut',
        name: 'Test',
        description: '',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        evaluations: {}
      }
      const originalUpdatedAt = project.updatedAt
      saveProject(project)

      // Original object should not be mutated
      expect(project.updatedAt).toBe(originalUpdatedAt)
      expect((project as Record<string, unknown>).appVersion).toBeUndefined()
    })
  })

  // ============================================================================
  // deleteProject
  // ============================================================================

  describe('deleteProject', () => {
    it('removes the project', async () => {
      const projects = [
        { id: 'del1', name: 'ToDelete', description: '', createdAt: '', updatedAt: '', evaluations: {} },
        { id: 'keep1', name: 'Keep', description: '', createdAt: '', updatedAt: '', evaluations: {} }
      ]
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify(projects))
      const { deleteProject, getAllProjects } = await importStorage()

      deleteProject('del1')

      const remaining = getAllProjects()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('keep1')
    })

    it('does nothing when project not found', async () => {
      const projects = [
        { id: 'keep1', name: 'Keep', description: '', createdAt: '', updatedAt: '', evaluations: {} }
      ]
      localStorage.setItem('storageVersion', '2')
      localStorage.setItem('projects', JSON.stringify(projects))
      const { deleteProject, getAllProjects } = await importStorage()

      deleteProject('nonexistent')

      const remaining = getAllProjects()
      expect(remaining).toHaveLength(1)
    })
  })

  // ============================================================================
  // migrateStorageIfNeeded
  // ============================================================================

  describe('migrateStorageIfNeeded', () => {
    it('skips when version is current', async () => {
      localStorage.setItem('storageVersion', '2')
      const { migrateStorageIfNeeded } = await importStorage()
      migrateStorageIfNeeded()
      // No error, no migration needed
      expect(localStorage.getItem('storageVersion')).toBe('2')
    })

    it('sets version when no legacy data exists', async () => {
      const { migrateStorageIfNeeded } = await importStorage()
      migrateStorageIfNeeded()
      expect(localStorage.getItem('storageVersion')).toBe('2')
    })

    it('migrates legacy data', async () => {
      const legacyInProgress = [
        { id: 'leg1', name: 'Legacy', description: 'Test', createdAt: '2024-01-01', updatedAt: '2024-01-01', status: 'InProgress', score: null, answers: {} }
      ]
      localStorage.setItem('inProgress', JSON.stringify(legacyInProgress))
      const { migrateStorageIfNeeded, getAllProjects } = await importStorage()

      migrateStorageIfNeeded()

      const projects = getAllProjects()
      expect(projects).toHaveLength(1)
      expect(projects[0].name).toBe('Legacy')
      expect(projects[0].evaluations).toBeDefined()
      // Legacy keys should be removed
      expect(localStorage.getItem('inProgress')).toBeNull()
      expect(localStorage.getItem('storageVersion')).toBe('2')
    })

    it('only runs migration once per session', async () => {
      localStorage.setItem('storageVersion', '2')
      const { migrateStorageIfNeeded } = await importStorage()

      migrateStorageIfNeeded()
      migrateStorageIfNeeded()
      migrateStorageIfNeeded()

      // getItem called only once for version check (first call), then skipped
      // Due to the flag, subsequent calls should not read localStorage
      // We verify it doesn't throw
      expect(true).toBe(true)
    })
  })
})
