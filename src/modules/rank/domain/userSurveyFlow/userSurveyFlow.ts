export interface Project {
  id: string
  name: string
  createdAt: string
  status: ProjectStatus
  modifiedAt?: string | undefined
}

enum ProjectStatus {
  DRAFT = 'draft',
  PUBLISH = 'publish'
}

export type FlowData = {
  id: string
  createdAt: string
  projectId: string
  steps: Step[]
  modifiedAt?: string
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

export interface userSurveyDraft {
  project: Project
  flowData: FlowData
}
