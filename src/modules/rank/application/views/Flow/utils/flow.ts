import type { DataSurvey } from '@/type/dataStepSurvey.type'
import type { UserSurveyStep } from '@/type/UserSurvey.type'

function getValuePointFlow(
  stateData: DataSurvey[] | undefined,
  isToggle: boolean,
  pointIndex: number,
  stepIndex: number
) {
  if (isToggle) {
    return stateData !== undefined ? stateData[stepIndex].rules[pointIndex].checked : false
  } else {
    return stateData !== undefined ? stateData[stepIndex].rules[pointIndex].value || 0 : 0
  }
}

export function buildResultMapping(userSurvey: UserSurveyStep[], dataSurvey: DataSurvey[]) {
  return userSurvey.map((step, stepIndex) => ({
    id: step.stepId,
    name: step.stepName,
    rules: step.rules.map((point, pointIndex) => ({
      id: point.id,
      ruleId: point.ruleId,
      value: getValuePointFlow(dataSurvey, point.type === 'toggle', pointIndex, stepIndex)
    }))
  }))
}

export function buildUserSurvey(dataSurvey: DataSurvey[]) {
  return dataSurvey.map((data) => ({
    stepId: data.id,
    stepName: data.section,
    rules: data.rules.map((rule) => ({
      id: rule.id,
      ruleId: rule.ruleId,
      type: rule.type,
      checked: rule.checked,
      value: rule.value
    }))
  }))
}

export function buildDataFlowWithDraftUserSurvey(
  draftUserSurvey: UserSurveyStep[],
  responseDataSurvey: DataSurvey[]
) {
  return responseDataSurvey.map((valueSurvey, indexSurvey) => ({
    ...valueSurvey,
    rules: valueSurvey.rules.map((valueSurveyRule, valueSurveyRuleIndex) => {
      const draftuser = draftUserSurvey[indexSurvey]
      const newValues = draftuser ? draftuser.rules[valueSurveyRuleIndex] : null
      return {
        ...valueSurveyRule,
        ...(newValues && {
          ...newValues
        })
      }
    })
  }))
}
