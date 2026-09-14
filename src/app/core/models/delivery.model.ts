export type DeliveryStatus = 'upcoming' | 'on_track' | 'at_risk' | 'delayed' | 'delivered' | 'accepted';

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  isRequired: boolean;
  category: 'code_quality' | 'security' | 'infrastructure' | 'client_approval' | 'documentation';
}

export interface DeliveryMilestone {
  id: string;
  projectId: string;
  milestoneTitle: string;
  releaseVersion: string;
  dueDate: string;
  actualDeliveryDate?: string;
  status: DeliveryStatus;
  checklist: ChecklistItem[];
  clientSignOff: {
    isSigned: boolean;
    signedBy?: string;
    signedAt?: string;
    rating?: number; // 1-5
    feedback?: string;
  };
  deploymentUrl?: string;
  notes?: string;
}
