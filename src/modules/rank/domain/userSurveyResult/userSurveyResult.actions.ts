import type { ResultData } from '@/type/result.type'
import type { UserSurveyResultOutput } from './userSurveyResult.output'

export function getCurrentProjectResult(
  userSurveyResult: UserSurveyResultOutput,
  currentProjectUuid: string
) {
  return userSurveyResult.getCurrentProjectResult(currentProjectUuid)
}

export function saveUserSurveyResult(userSurveyResult: UserSurveyResultOutput, data: ResultData) {
  return userSurveyResult.saveUserSurveyResult(data)
}

export function deleteProjectResult(
  userSurveyResult: UserSurveyResultOutput,
  projectId: string,
  resultId: string
) {
  return userSurveyResult.deleteProjectResult(projectId, resultId)
}
