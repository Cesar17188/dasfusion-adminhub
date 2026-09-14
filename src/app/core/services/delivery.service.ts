import { Injectable, computed, signal } from '@angular/core';
import { ChecklistItem, DeliveryMilestone, DeliveryStatus } from '../models/delivery.model';
import { INITIAL_DELIVERY_MILESTONES } from './mock-data';

const STORAGE_KEY_DELIVERIES = 'df_deliveries';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  readonly milestones = signal<DeliveryMilestone[]>(this.loadMilestones());
  readonly selectedProjectId = signal<string>('all');
  readonly statusFilter = signal<DeliveryStatus | 'all'>('all');

  readonly filteredMilestones = computed(() => {
    const prjId = this.selectedProjectId();
    const status = this.statusFilter();

    return this.milestones().filter(m => {
      const matchPrj = prjId === 'all' || m.projectId === prjId;
      const matchStatus = status === 'all' || m.status === status;
      return matchPrj && matchStatus;
    });
  });

  readonly upcomingMilestones = computed(() => {
    return this.milestones().filter(m => m.status !== 'accepted' && m.status !== 'delivered');
  });

  readonly totalMilestonesCount = computed(() => this.milestones().length);
  readonly onTrackCount = computed(() => this.milestones().filter(m => m.status === 'on_track').length);
  readonly atRiskCount = computed(() => this.milestones().filter(m => m.status === 'at_risk').length);
  readonly delayedCount = computed(() => this.milestones().filter(m => m.status === 'delayed').length);
  readonly deliveredCount = computed(() => 
    this.milestones().filter(m => m.status === 'delivered' || m.status === 'accepted').length
  );

  private loadMilestones(): DeliveryMilestone[] {
    const saved = localStorage.getItem(STORAGE_KEY_DELIVERIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_DELIVERY_MILESTONES;
  }

  private saveMilestones(updated: DeliveryMilestone[]) {
    this.milestones.set(updated);
    localStorage.setItem(STORAGE_KEY_DELIVERIES, JSON.stringify(updated));
  }

  selectProject(projectId: string) {
    this.selectedProjectId.set(projectId);
  }

  createMilestone(data: Omit<DeliveryMilestone, 'id'>): DeliveryMilestone {
    const newM: DeliveryMilestone = {
      ...data,
      id: 'del-' + Date.now().toString(36)
    };
    const updated = [newM, ...this.milestones()];
    this.saveMilestones(updated);
    return newM;
  }

  updateMilestone(id: string, updates: Partial<DeliveryMilestone>) {
    const updated = this.milestones().map(m => {
      if (m.id === id) {
        return { ...m, ...updates };
      }
      return m;
    });
    this.saveMilestones(updated);
  }

  toggleChecklistItem(milestoneId: string, itemId: string) {
    const milestone = this.milestones().find(m => m.id === milestoneId);
    if (!milestone) return;

    const updatedChecklist = milestone.checklist.map(item => {
      if (item.id === itemId) {
        return { ...item, isCompleted: !item.isCompleted };
      }
      return item;
    });

    // Check if all required items are checked
    const allRequiredDone = updatedChecklist
      .filter(i => i.isRequired)
      .every(i => i.isCompleted);

    let newStatus = milestone.status;
    if (allRequiredDone && milestone.status !== 'accepted') {
      newStatus = 'on_track';
    }

    this.updateMilestone(milestoneId, {
      checklist: updatedChecklist,
      status: newStatus
    });
  }

  addChecklistItem(milestoneId: string, label: string, isRequired = true, category: ChecklistItem['category'] = 'code_quality') {
    const milestone = this.milestones().find(m => m.id === milestoneId);
    if (!milestone) return;

    const newItem: ChecklistItem = {
      id: 'c-' + Date.now().toString(36),
      label,
      isCompleted: false,
      isRequired,
      category
    };

    const updatedChecklist = [...milestone.checklist, newItem];
    this.updateMilestone(milestoneId, { checklist: updatedChecklist });
  }

  signOffMilestone(milestoneId: string, signedBy: string, rating: number, feedback?: string) {
    this.updateMilestone(milestoneId, {
      status: 'accepted',
      actualDeliveryDate: new Date().toISOString().substring(0, 10),
      clientSignOff: {
        isSigned: true,
        signedBy,
        signedAt: new Date().toISOString(),
        rating,
        feedback
      }
    });
  }
}
