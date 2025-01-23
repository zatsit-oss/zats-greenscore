import type { UserSurveyOutput } from '@/modules/rank/domain/userSurveyFlow.output'
import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'

export class UserSurveyFlowStore implements UserSurveyOutput {
  getDraftProjectsFromStore() {
    return useFlowStore().get
  }
  deleteUserSurveyFlowDataFromStore() {
    useFlowStore().reset()
  }
}
