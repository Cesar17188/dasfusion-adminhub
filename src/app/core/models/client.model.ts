export type ClientStatus = 'lead' | 'contacted' | 'negotiation' | 'active' | 'completed' | 'on_hold';

export interface ClientNote {
  id: string;
  author: string;
  date: string;
  content: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: ClientStatus;
  totalBudget: number;
  budgetRange?: string;
  estimatedTimeline?: string;
  projectType?: string;
  source: 'DASFusion-hub' | 'Direct' | 'Referral' | 'LinkedIn';
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
  country?: string;
  tags: string[];
  notes: ClientNote[];
  hubMessage?: string;
  details?: string;
}

export interface SupabaseLeadDb {
  id: string;
  created_at: string | null;
  full_name: string;
  company: string | null;
  email: string;
  project_type: string | null;
  budget_range: string | null;
  estimated_timeline: string | null;
  details: string | null;
  status: string | null;
}
