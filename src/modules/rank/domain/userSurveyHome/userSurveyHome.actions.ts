import type { UserSurveyHome } from '../../infrastructure/controllers/userSurvey/userSurveyHome.store'

export function getProjectsResult(userSurveyHome: UserSurveyHome) {
  return userSurveyHome.getProjectsResult()
}
