import type { UserSurveyOutput } from '@/modules/rank/domain/userSurveyFlow.output'
import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'

export class UserSurveyFlowStore implements UserSurveyOutput {
  getUserSurveyDraft() {
    return useFlowStore().get
  }
  deleteUserSurveyFlowData() {
    useFlowStore().reset()
  }
}
