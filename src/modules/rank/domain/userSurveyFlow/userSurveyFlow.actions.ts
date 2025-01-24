import type { UserSurveyOutput } from '../userSurveyFlow/userSurveyFlow.output'

export function getUserSurveyDraft(userSurveyOutput: UserSurveyOutput) {
  return userSurveyOutput.getUserSurveyDraft()
}

export function deleteUserSurveyFlowData(userSurveyOutput: UserSurveyOutput) {
  userSurveyOutput.deleteUserSurveyFlowData()
}
