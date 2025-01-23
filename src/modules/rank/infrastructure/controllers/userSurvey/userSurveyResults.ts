import { useResultsStore } from '@/stores/results'
import type { ResultData } from '@/type/result.type'
import { createProjectsResults } from './utils/userSurveyUtils'

function getCurrentProjectResultFromStore(currentProjectUuid: string) {
  const resultsStore = useResultsStore().get
  return resultsStore.find((result) => result.project.id === currentProjectUuid)
}

function deleteProjectResultFromStore(projectId: string, resultId: string) {
  const store = useResultsStore()
  store.deleteProjectResult(projectId, resultId)
}

function saveUserSurveyResultsFromStore(data: ResultData) {
  const resultsStore = useResultsStore()
  resultsStore.addProject(data.project)
  resultsStore.addResult(data.result)
}

export function getCurrentProjectResult(currentProjectUuid: string) {
  return getCurrentProjectResultFromStore(currentProjectUuid)
}

export function saveUserSurveyResult(data: ResultData) {
  saveUserSurveyResultsFromStore(data)
  updateProjectsResult()
}

export function updateProjectsResult() {
  const resultsStore = useResultsStore()
  const results = useResultsStore().getResults
  const projects = useResultsStore().getProjects
  const projectsResult = createProjectsResults({ projects, results })
  if (projectsResult) {
    resultsStore.$patch({ projectsResult })
  }
}

export function deleteProjectResult(projectId: string, resultId: string) {
  deleteProjectResultFromStore(projectId, resultId)
  updateProjectsResult()
}
