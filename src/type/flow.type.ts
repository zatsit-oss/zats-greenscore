export type FlowStepRules = {
  id: number
  value: boolean | number
}

export type FlowStep = {
  id: number
  rules: FlowStepRules[]
}

export type Step = {
  stepId: number
  stepName: string
  rules: {
    id: number
    ruleId: string
    type: string
    checked: boolean | null
    value: number | null
  }[]
}

export type FlowData = {
  id: string
  createdAt: string
  projectId: string
  steps: Step[]
  modifiedAt?: string
}
