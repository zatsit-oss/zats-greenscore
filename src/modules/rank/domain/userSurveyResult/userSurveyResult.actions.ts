import type { ResultData } from '@/type/result.type'
import type { userSurveyResult } from './userSurveyResult.output'

export function getCurrentProjectResult(
  userSurveyResult: userSurveyResult,
  currentProjectUuid: string
) {
  return userSurveyResult.getCurrentProjectResult(currentProjectUuid)
}

export function saveUserSurveyResult(userSurveyResult: userSurveyResult, data: ResultData) {
  return userSurveyResult.saveUserSurveyResult(data)
}

export function deleteProjectResult(
  userSurveyResult: userSurveyResult,
  projectId: string,
  resultId: string
) {
  return userSurveyResult.deleteProjectResult(projectId, resultId)
}
