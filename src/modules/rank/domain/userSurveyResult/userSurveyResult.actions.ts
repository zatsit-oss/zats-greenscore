import type { userSurveyResults } from './userSurveyResult.output'

export function getCurrentProjectResult(userSurveyResult: userSurveyResults) {
  return userSurveyResult.getCurrentProjectResult(currentProjectUuid)
}

export function saveUserSurveyResult(userSurveyResult: userSurveyResults) {
  return userSurveyResult.saveUserSurveyResult(data)
}

export function deleteProjectResult(userSurveyResult: userSurveyResults) {
  return userSurveyResult.deleteProjectResult(projectId, resultId)
}
