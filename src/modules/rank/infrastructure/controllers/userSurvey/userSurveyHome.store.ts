import type { UserSurveyHomeOutput } from '@/modules/rank/domain/userSurveyHome/userSurveyHome.output'
import { useResultsStore } from '@/modules/rank/infrastructure/controllers/stores/results'

function getProjectsResultFromStore() {
  return useResultsStore().get
}

export class UserSurveyHome implements UserSurveyHomeOutput {
  getProjectsResult() {
    return getProjectsResultFromStore()
  }
}
