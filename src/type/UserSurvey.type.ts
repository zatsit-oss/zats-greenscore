import type { ProjectType } from './project.type'

export type UserSurveyRules = {
  id: number
  ruleId: string
  type: string
  checked: boolean | null
  value: number | null
}

export type UserSurveyStep = {
  stepId: number
  stepName: string
  rules: UserSurveyRules[]
}

type UserDraft = {
  createdAt: string
  id: string
  projectId: string
  steps: UserSurveyStep[]
  modifiedAt?: string
}

export type UserSurveyDraftAPi = {
  flowData: UserDraft
  project: ProjectType
}
