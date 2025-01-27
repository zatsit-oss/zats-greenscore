import type { ProjectType } from '@/type/project.type'

type ResultRules = {
  id: number
  ruleId: string
  value: number | boolean | null
}

type ResultSteps = {
  rules: ResultRules[]
  id: number
  name: string
}

type Result = {
  id: string
  createdAt: string
  projectId: string
  rank: string
  steps: ResultSteps[]
  modifiedAt?: string
}

export type ProjectResult = {
  project: ProjectType
  result: Result
}
