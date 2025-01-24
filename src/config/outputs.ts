import { DataSurvey } from '@/modules/rank/infrastructure/controllers/dataSurvey/dataSurvey.local'
import { UserSurveyFlowStore } from '@/modules/rank/infrastructure/controllers/userSurvey/userSurveyFlow.store'
import { UserSurveyHome } from '@/modules/rank/infrastructure/controllers/userSurvey/userSurveyHome.store'
import { UserSurveyResultsStore } from '@/modules/rank/infrastructure/controllers/userSurvey/userSurveyResults.store'

export const outputs = {
  userSurveyFlow: new UserSurveyFlowStore(),
  userSurveyResult: new UserSurveyResultsStore(),
  dataSurvey: new DataSurvey(),
  userSurveyHome: new UserSurveyHome()
}
