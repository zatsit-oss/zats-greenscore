import type { DataSurvey } from '@/type/dataStepSurvey.type'
import type { FlowStep, FlowStepRules } from '@/type/flow.type'
function getFlowPoint(ruleType: string, rulePoint: number, flowValue: boolean | number) {
  if (ruleType === 'toggle') {
    return flowValue ? rulePoint : 0
  } else {
    return flowValue === 0 ? 0 : rulePoint
  }
}

function computeTotalPoints(dataSurvey: DataSurvey[], resultsFlow: FlowStep[]) {
  return resultsFlow.reduce((acc: any, step: FlowStep, flowIndex: number) => {
    const d = step.rules.reduce((acc: number, rule: FlowStepRules, stepPointsIndex: number) => {
      const rulePoint = dataSurvey[flowIndex].rules[stepPointsIndex].point
      const ruleType = dataSurvey[flowIndex].rules[stepPointsIndex].type
      const point = getFlowPoint(ruleType, rulePoint, rule.value)
      return point + acc
    }, 0)
    return acc + d
  }, 0)
}

export function getRankingScore(dataSurvey: DataSurvey[], value: any) {
  const totalPoint = computeTotalPoints(dataSurvey, value)
  if (totalPoint > 6000) {
    return 'A'
  }
  if (totalPoint >= 3000 && totalPoint < 6000) {
    return 'B'
  }
  if (totalPoint >= 2000 && totalPoint < 3000) {
    return 'C'
  }
  if (totalPoint >= 1000 && totalPoint < 2000) {
    return 'D'
  }
  return 'E'
}

export function getRankingColor(ranking: string) {
  switch (ranking) {
    case 'A':
      return '--excellentV2-rating-color'
    case 'B':
      return '--acceptableV2-rating-color'
    case 'C':
      return '--averagev2-rating-color'
    case 'D':
      return '--poorv2-rating-color'
    default:
      return '--showstopperv2-rating-color'
  }
}
