import { UserSurveyFlowStore } from '@/modules/rank/infrastructure/controllers/userSurvey/userSurveyFlow.store'

export const outputs = {
  userSurveyFlow: new UserSurveyFlowStore(),
  userSurveyResult: new UserSurveyFlowStore()
}
