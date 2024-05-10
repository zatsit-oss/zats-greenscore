import { DATA_FLOW_STEPS } from '@/utils/steps'
import type { data } from '@/type/dataStepSurvey.type'

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

export function getDataSurvey() {
  return buildDataSurvey(DATA_FLOW_STEPS)
}
