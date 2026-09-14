export type PhaseType = 'Architecture & Specs' | 'Frontend Engineering' | 'Backend & AI Core' | 'Integrations & APIs' | 'DevOps & Infrastructure';
export type PhaseStatus = 'not_started' | 'in_progress' | 'in_review' | 'completed' | 'blocked';

export interface DevTask {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  estimatedHours: number;
  spentHours: number;
  isDone: boolean;
}

export interface DevPhase {
  id: string;
  projectId: string;
  phaseName: PhaseType;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  loggedHours: number;
  status: PhaseStatus;
  leadEngineer: string;
  progressPercentage: number;
  tasks: DevTask[];
}

export interface TimeLogEntry {
  id: string;
  projectId: string;
  phaseId: string;
  engineerName: string;
  date: string;
  hours: number;
  description: string;
}
