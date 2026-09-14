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
  source: 'DASFusion-hub' | 'Direct' | 'Referral' | 'LinkedIn';
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
  country?: string;
  tags: string[];
  notes: ClientNote[];
  hubMessage?: string;
}
