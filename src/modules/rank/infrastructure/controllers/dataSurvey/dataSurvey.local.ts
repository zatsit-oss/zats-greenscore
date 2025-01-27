import type { DataSurveyOutput } from '@/modules/rank/domain/dataSurvey/dataSurvey.output'
import type { data } from '@/type/dataStepSurvey.type'
import { DATA_FLOW_STEPS } from '@/utils/steps'

function buildDataSurvey(response: data[]) {
  return response
    .map((step) => ({
      ...step,
      rules: step.rules.map((point) => ({
        ...point,
        checked: point.type === 'toggle' ? false : null,
        value: point.type === 'input' ? 0 : null
      }))
    }))
    .sort((stepA, stepB) => stepA.id - stepB.id)
}

export class DataSurvey implements DataSurveyOutput {
  getDataSurvey() {
    return buildDataSurvey(DATA_FLOW_STEPS)
  }
}
