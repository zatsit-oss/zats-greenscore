import type { userSurveyDraft } from './userSurveyFlow'

export interface UserSurveyOutput {
  getUserSurveyDraft(): userSurveyDraft
  deleteUserSurveyFlowData(): () => void
}
