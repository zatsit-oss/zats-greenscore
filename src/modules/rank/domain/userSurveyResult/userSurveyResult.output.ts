import type { ProjectResult, ResultData } from '@/type/result.type'

export interface UserSurveyResultOutput {
  getCurrentProjectResult(currentProjectUuid: string): ProjectResult | undefined
  saveUserSurveyResult(data: ResultData): any
  deleteProjectResult(projectId: string, resultId: string): any
}
