import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'
import { useResultsStore } from '@/modules/rank/infrastructure/controllers/stores/results'

// export class UserSurveyFlowStore implements UserSurveyOutput {
//   getUserSurveyDraft() {
//     return useFlowStore().get
//   }
//   deleteUserSurveyFlowData() {
//     useFlowStore().reset()
//   }
// }

function getProjectsResultFromStore() {
  return useResultsStore().get
}

function getDraftProjectsFromStore() {
  return useFlowStore().get
}

export function getProjectsResult() {
  return getProjectsResultFromStore()
}

export function getDraftProjectsResult() {
  return getDraftProjectsFromStore()
}
