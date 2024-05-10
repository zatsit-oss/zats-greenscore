export type ProjectType = {
  id: string
  name: string
  createdAt: string
  status: ProjectStatus
  modifiedAt?: string
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PUBLISH = 'publish'
}
