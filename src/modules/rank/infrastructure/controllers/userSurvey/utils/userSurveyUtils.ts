import type { ResultsStore } from '@/type/result.type'

export function createProjectsResults(data: ResultsStore) {
  return data.projects
    .map((project) => {
      const result = data.results.find((results) => project.id === results.projectId)
      if (result) {
        return {
          project,
          result
        }
      }
    })
    .filter((data) => data !== undefined)
}
