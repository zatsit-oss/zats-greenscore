import type { DataSurvey } from '@/type/dataStepSurvey.type'
import { defineStore } from 'pinia'

export const useDataSurvey = defineStore('dataSurvey', {
  state: () => {
    return {
      dataSurvey: {} as DataSurvey[],
      isFetching: false
    }
  },
  actions: {
    init(elements: DataSurvey[], isFetching?: boolean) {
      this.dataSurvey = elements
      this.isFetching = isFetching || false
    }, 
    add(elements: DataSurvey[]) {
      this.dataSurvey = elements
      return this.dataSurvey
    },
    get() {
      return this.dataSurvey
    }
  },
  persist: true,
})
