type rules = {
  description: string
  id: number
  point: number
  ruleId: string
  title: string
  type: string
}

export type data = {
  section: string
  id: number
  title: string
  rules: rules[]
}

export type DataSurveyRules = {
  description: string
  id: number
  point: number
  ruleId: string
  title: string
  type: string
  checked: boolean | null
  value: number | null
  detail : string | null
}

export type DataSurvey = {
  rules: DataSurveyRules[]
  section: string
  id: number
  title: string
}
