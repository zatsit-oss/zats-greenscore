import { useFlowStore } from '@/stores/flow'
import { useResultsStore } from '@/stores/results'

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
