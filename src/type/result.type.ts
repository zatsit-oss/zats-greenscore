import type { ProjectType } from './project.type'

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

export type Result = {
  id: string
  createdAt: string
  projectId: string
  rank: string
  steps: ResultSteps[]
  modifiedAt?: string
}

export type ResultsStore = {
  projects: ProjectType[]
  results: Result[]
}

export type ProjectResult = {
  project: ProjectType
  result: Result
}

export type ProjectsResults = {
  project: ProjectType
  result: Result
}[]

export type ResultsAPI = {
  projects: ProjectType[]
  results: Result[]
}

export type ResultData = {
  result: Result
  project: ProjectType
}
