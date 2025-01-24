import type { UserSurveyHomeOutput } from '@/modules/rank/domain/userSurveyHome/userSurveyHome.output'
import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'
import { useResultsStore } from '@/modules/rank/infrastructure/controllers/stores/results'

function getProjectsResultFromStore() {
  return useResultsStore().get
}

function getDraftProjectsFromStore() {
  return useFlowStore().get
}

export class UserSurveyHome implements UserSurveyHomeOutput {
  getProjectsResult() {
    return getProjectsResultFromStore()
  }

  getDraftProjectsResult() {
    return getDraftProjectsFromStore()
  }
}
