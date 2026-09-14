export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export interface ProposalScopeItem {
  feature: string;
  description: string;
  deliverables?: string[];
  estimatedHours?: number;
}

export interface Proposal {
  id: string;
  accessToken?: string;
  leadId?: string;
  clientName: string;
  title: string;
  scopeBreakdown: ProposalScopeItem[] | Record<string, any>;
  totalEstimate: number;
  expiresAt?: string;
  viewCount: number;
  status: ProposalStatus;
  createdAt?: string;
}

export interface SupabaseProposalDb {
  id: string;
  access_token: string | null;
  lead_id: string | null;
  client_name: string;
  title: string;
  scope_breakdown: any;
  total_estimate: number | null;
  expires_at: string | null;
  view_count: number | null;
  status: string | null;
}
