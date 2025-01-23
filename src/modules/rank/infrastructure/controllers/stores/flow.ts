import { defineStore } from 'pinia'
import type { FlowData, Step } from '../../../../../type/flow.type'
import type { ProjectType } from '@/type/project.type'

export const useFlowStore = defineStore('flow', {
  state: () => {
    return {
      project: {} as ProjectType,
      flowData: {} as FlowData,
      isFetching: false
    }
  },
  getters: {
    get: (state) => {
      return {
        project: state.project,
        flowData: state.flowData
      }
    }
  },
  actions: {
    init(elements: FlowData, isFetching: boolean, project: ProjectType) {
      ;(this.flowData = elements), (this.isFetching = isFetching), (this.project = project)
    },
    initFlowData(elements: FlowData) {
      this.flowData = elements
    },
    addProject(project: ProjectType) {
      this.project = project
    },
    addStepData(elements: Step[], isFetching: boolean) {
      this.flowData = { ...this.flowData, steps: elements }
      this.isFetching = isFetching
    },
    add(elements: FlowData, isFetching: boolean) {
      this.flowData = elements
      this.isFetching = isFetching
    },
    reset() {
      this.project = {} as ProjectType
      this.flowData = {} as FlowData
      this.isFetching = false
    }
  },
  persist: true
})
