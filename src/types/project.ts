/**
 * Types TypeScript pour la structure des projets GreenScore
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum ProjectStatus {
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed'
}

export enum ProjectRanking {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface AuditAnswers {
  [questionId: string]: boolean | string | number;
}

export interface AbstractProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInProgress extends AbstractProject {
  status: ProjectStatus.IN_PROGRESS;
  score: null;
  ranking?: null;
  answers?: AuditAnswers;
}

/**
 * Projet complété
 */
export interface ProjectCompleted extends AbstractProject {
  status: ProjectStatus.COMPLETED
  score: number;
  ranking: ProjectRanking;
  answers: AuditAnswers;
}

export type Project = ProjectInProgress | ProjectCompleted;

/**
 * Input pour créer un nouveau projet
 */
export interface CreateProjectInput {
  name: string;
  description: string;
}

/**
 * Données pour compléter un projet
 */
export interface CompleteProjectData {
  score: number;
  ranking: ProjectRanking;
  answers: AuditAnswers;
}

