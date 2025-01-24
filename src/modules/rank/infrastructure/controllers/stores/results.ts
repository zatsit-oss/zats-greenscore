import type { ProjectType } from '@/type/project.type'
import type { Result, ProjectsResults, ResultsStore } from '@/type/result.type'
import { defineStore } from 'pinia'

export const useResultsStore = defineStore('results', {
  state: () => {
    return {
      results: [] as Result[],
      projects: [] as ProjectType[],
      projectsResult: [] as ProjectsResults
    }
  },
  getters: {
    get: (state) => {
      return state.projectsResult
    },
    getResults: (state) => {
      return state.results
    },
    getProjects: (state) => {
      return state.projects
    }
  },
  actions: {
    init(elements: ResultsStore) {
      ;(this.results = elements.results), (this.projects = elements.projects)
    },
    addResult(elements: Result) {
      this.results = [...this.results, elements]
    },
    addProject(element: ProjectType) {
      this.projects = [...this.projects, element]
    },
    addResults(elements: Result[]) {
      this.results = elements
    },
    addProjects(element: ProjectType[]) {
      this.projects = element
    },
    deleteProjectResult(projectId: string, resultId: string) {
      this.projects = this.projects.filter((project) => project.id !== projectId)
      this.results = this.results.filter((result) => resultId !== result.id)
    }
  },
  persist: true
})
