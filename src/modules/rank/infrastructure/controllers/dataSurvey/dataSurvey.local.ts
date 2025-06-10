import type { DataSurveyOutput } from '@/modules/rank/domain/dataSurvey/dataSurvey.output'
import type { data } from '@/type/dataStepSurvey.type'
import { DATA_FLOW_STEPS, type Rules } from '@/utils/steps'
import DETAILS from '../../../../../config/fields-detail.json'

export function buildDataSurvey(response: data[]) {
  return response
    .map((step) => ({
      ...step,
      rules: buildRules(step.rules)
    }))
    .sort((stepA, stepB) => stepA.id - stepB.id)
}

export function buildRules(rules: Rules[]) {
  return rules.map((rule) => ({
    ...rule,
    checked: rule.type === 'toggle' ? false : null,
    value: rule.type === 'number' ? 0 : null,
    detail: DETAILS[rule.ruleId as keyof typeof DETAILS] ?? ''
  }))
}

export class DataSurvey implements DataSurveyOutput {
  getDataSurvey() {
    return buildDataSurvey(DATA_FLOW_STEPS)
  }
}
