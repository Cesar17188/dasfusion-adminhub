export type ProjectStatus = 'lead' | 'architecture' | 'development' | 'testing' | 'delivery' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectCategory = 'AI & Machine Learning' | 'Fullstack Web' | 'Mobile App' | 'Enterprise Cloud' | 'Automation & Bots' | 'Data Engineering';

export interface ProjectRequirement {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: 'must_have' | 'nice_to_have';
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number;
  currency: 'USD' | 'EUR' | 'MXN';
  startDate: string;
  targetDeliveryDate: string;
  actualDeliveryDate?: string;
  techStack: string[];
  requirements: ProjectRequirement[];
  hubSubmissionId?: string;
  progressPercentage: number;
  leadScore?: number; // 0-100 calculated from hub form
  assignedLeadDev?: string;
  assignedQALead?: string;
  createdAt: string;
  liveUrl?: string;
}

export interface SupabaseProjectDb {
  id: string;
  user_id?: string | null;
  lead_id?: string | null;
  title: string;
  description: string;
  tech_stack: string[] | null;
  live_url: string | null;
  status?: string | null;
  priority?: string | null;
  budget?: number | null;
  progress_percentage?: number | null;
  start_date?: string | null;
  target_delivery_date?: string | null;
  created_at?: string | null;
}
