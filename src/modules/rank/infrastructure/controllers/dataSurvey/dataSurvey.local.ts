import { DATA_FLOW_STEPS } from '@/utils/steps'
import type { data } from '@/type/dataStepSurvey.type'
import type { Survey } from '@/modules/rank/domain/userSurveyHome/userSurveyHome.output'

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

export class UserSurveyResultsStore implements Survey {
  getDataSurvey() {
    return buildDataSurvey(DATA_FLOW_STEPS)
  }
}
