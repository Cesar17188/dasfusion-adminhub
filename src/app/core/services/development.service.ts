import { Injectable, computed, signal } from '@angular/core';
import { DevPhase, DevTask, PhaseStatus, TimeLogEntry } from '../models/development.model';
import { INITIAL_DEV_PHASES, INITIAL_TIME_LOGS } from './mock-data';

const STORAGE_KEY_DEV_PHASES = 'df_dev_phases';
const STORAGE_KEY_TIME_LOGS = 'df_time_logs';

@Injectable({
  providedIn: 'root'
})
export class DevelopmentService {
  readonly phases = signal<DevPhase[]>(this.loadPhases());
  readonly timeLogs = signal<TimeLogEntry[]>(this.loadTimeLogs());
  readonly selectedProjectId = signal<string>('prj-01');

  readonly projectPhases = computed(() => {
    const prjId = this.selectedProjectId();
    return this.phases().filter(p => p.projectId === prjId);
  });

  readonly projectTimeLogs = computed(() => {
    const prjId = this.selectedProjectId();
    return this.timeLogs().filter(tl => tl.projectId === prjId);
  });

  readonly totalEstimatedHours = computed(() => 
    this.phases().reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0)
  );

  readonly totalLoggedHours = computed(() => 
    this.phases().reduce((acc, curr) => acc + (curr.loggedHours || 0), 0)
  );

  readonly activePhasesCount = computed(() => 
    this.phases().filter(p => p.status === 'in_progress').length
  );

  private loadPhases(): DevPhase[] {
    const saved = localStorage.getItem(STORAGE_KEY_DEV_PHASES);
    if (saved) {
      try {
        const parsed: DevPhase[] = JSON.parse(saved);
        return parsed.filter(p => !p.id.startsWith('ph-0'));
      } catch {
        // fallback
      }
    }
    return [];
  }

  private savePhases(updated: DevPhase[]) {
    this.phases.set(updated);
    localStorage.setItem(STORAGE_KEY_DEV_PHASES, JSON.stringify(updated));
  }

  private loadTimeLogs(): TimeLogEntry[] {
    const saved = localStorage.getItem(STORAGE_KEY_TIME_LOGS);
    if (saved) {
      try {
        const parsed: TimeLogEntry[] = JSON.parse(saved);
        return parsed.filter(tl => !tl.id.startsWith('tl-0'));
      } catch {
        // fallback
      }
    }
    return [];
  }

  private saveTimeLogs(updated: TimeLogEntry[]) {
    this.timeLogs.set(updated);
    localStorage.setItem(STORAGE_KEY_TIME_LOGS, JSON.stringify(updated));
  }

  selectProject(projectId: string) {
    this.selectedProjectId.set(projectId);
  }

  createPhase(phaseData: Omit<DevPhase, 'id' | 'loggedHours' | 'progressPercentage' | 'tasks'> & { tasks?: DevTask[] }): DevPhase {
    const newPhase: DevPhase = {
      ...phaseData,
      id: 'phase-' + Date.now().toString(36),
      loggedHours: 0,
      progressPercentage: 0,
      tasks: phaseData.tasks || []
    };

    const updated = [...this.phases(), newPhase];
    this.savePhases(updated);
    return newPhase;
  }

  updatePhase(id: string, updates: Partial<DevPhase>) {
    const updated = this.phases().map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    this.savePhases(updated);
  }

  updatePhaseStatus(id: string, status: PhaseStatus) {
    const phase = this.phases().find(p => p.id === id);
    if (!phase) return;

    let progress = phase.progressPercentage;
    if (status === 'completed') progress = 100;
    if (status === 'not_started') progress = 0;

    this.updatePhase(id, { status, progressPercentage: progress });
  }

  toggleTask(phaseId: string, taskId: string) {
    const phase = this.phases().find(p => p.id === phaseId);
    if (!phase) return;

    const updatedTasks = phase.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, isDone: !t.isDone };
      }
      return t;
    });

    const doneCount = updatedTasks.filter(t => t.isDone).length;
    const total = updatedTasks.length;
    const progress = total > 0 ? Math.round((doneCount / total) * 100) : phase.progressPercentage;
    const isCompleted = doneCount === total && total > 0;

    this.updatePhase(phaseId, {
      tasks: updatedTasks,
      progressPercentage: progress,
      status: isCompleted ? 'completed' : phase.status === 'not_started' ? 'in_progress' : phase.status
    });
  }

  addTask(phaseId: string, title: string, assignee: string, estimatedHours: number) {
    const phase = this.phases().find(p => p.id === phaseId);
    if (!phase) return;

    const newTask: DevTask = {
      id: 'task-' + Date.now().toString(36),
      title,
      assignee,
      estimatedHours,
      spentHours: 0,
      isDone: false
    };

    const updatedTasks = [...phase.tasks, newTask];
    this.updatePhase(phaseId, {
      tasks: updatedTasks,
      estimatedHours: phase.estimatedHours + estimatedHours
    });
  }

  logTime(projectId: string, phaseId: string, engineerName: string, hours: number, description: string) {
    const newLog: TimeLogEntry = {
      id: 'tl-' + Date.now().toString(36),
      projectId,
      phaseId,
      engineerName,
      date: new Date().toISOString().substring(0, 10),
      hours,
      description
    };

    const updatedLogs = [newLog, ...this.timeLogs()];
    this.saveTimeLogs(updatedLogs);

    // Update logged hours on the phase
    const phase = this.phases().find(p => p.id === phaseId);
    if (phase) {
      const updatedLogged = Number(phase.loggedHours || 0) + Number(hours);
      this.updatePhase(phaseId, { loggedHours: updatedLogged });
    }
  }
}
