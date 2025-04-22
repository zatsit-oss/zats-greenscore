export type StepRules = {
  description: string
  id: number
  point: number
  ruleId: string
  title: string
  type: string
  checked: boolean | null
  value: number | null
  detail: string | null
}

export type Step = {
  id: number
  section: string
  title: string
  rules: StepRules[]
}
