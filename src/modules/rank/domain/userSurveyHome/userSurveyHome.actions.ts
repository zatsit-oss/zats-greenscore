import type { UserSurveyHome } from '../../infrastructure/controllers/userSurvey/userSurveyHome.store'

export function getProjectsResult(userSurveyHome: UserSurveyHome) {
  return userSurveyHome.getProjectsResult()
}

export function getDraftProjectsResult(userSurveyHome: UserSurveyHome) {
  return userSurveyHome.getDraftProjectsResult()
}
