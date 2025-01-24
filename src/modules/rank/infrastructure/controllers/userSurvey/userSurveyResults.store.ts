import { useResultsStore } from '@/modules/rank/infrastructure/controllers/stores/results'
import type { ResultData } from '@/type/result.type'
import { createProjectsResults } from './utils/userSurveyUtils'
import type { UserSurveyResultOutput } from '@/modules/rank/domain/userSurveyResult/userSurveyResult.output'

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

function updateProjectsResult() {
  const resultsStore = useResultsStore()
  const results = useResultsStore().getResults
  const projects = useResultsStore().getProjects
  const projectsResult = createProjectsResults({ projects, results })
  if (projectsResult) {
    resultsStore.$patch({ projectsResult })
  }
}

export class UserSurveyResultsStore implements UserSurveyResultOutput {
  getCurrentProjectResult(currentProjectUuid: string) {
    return getCurrentProjectResultFromStore(currentProjectUuid)
  }

  saveUserSurveyResult(data: ResultData) {
    saveUserSurveyResultsFromStore(data)
    updateProjectsResult()
  }

  deleteProjectResult(projectId: string, resultId: string) {
    deleteProjectResultFromStore(projectId, resultId)
    updateProjectsResult()
  }
}
