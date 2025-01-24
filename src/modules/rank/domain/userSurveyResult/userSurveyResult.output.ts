import type { ResultData } from '@/type/result.type'

export interface userSurveyResult {
  getCurrentProjectResult(currentProjectUuid: string): any
  saveUserSurveyResult(data: ResultData): any
  deleteProjectResult(projectId: string, resultId: string): any
}
