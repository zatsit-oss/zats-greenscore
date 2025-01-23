import { useFlowStore } from '@/modules/rank/infrastructure/controllers/stores/flow'
import { useResultsStore } from '@/modules/rank/infrastructure/controllers/stores/results'

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
