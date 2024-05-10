import { useFlowStore } from '@/stores/flow'

function getDraftProjectsFromStore() {
  return useFlowStore().get
}

function deleteUserSurveyFlowDataFromStore() {
  useFlowStore().reset()
}

export function getUserSurveyDraft() {
  return getDraftProjectsFromStore()
}

export function deleteUserSurveyFlowData() {
  deleteUserSurveyFlowDataFromStore()
}
