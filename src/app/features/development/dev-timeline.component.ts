import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { DevelopmentService } from '../../core/services/development.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { DevPhase, PhaseType } from '../../core/models/development.model';

@Component({
  selector: 'app-dev-timeline',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusBadgeComponent, 
    ProgressBarComponent, 
    ModalComponent
  ],
  template: `
    <div class="dev-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">INGENIERÍA & SPRINTS</span>
            <span class="caption">Control de Horas y Tiempos</span>
          </div>
          <h1 class="headline-md page-title">Tiempos de Desarrollo & Cronograma</h1>
          <p class="body-md page-subtitle">
            Planificación de sprints, fases arquitectónicas, registro de horas por ingeniero y progreso técnico.
          </p>
        </div>

        <div class="header-actions">
          <!-- Project Switcher -->
          <div class="project-selector-wrapper">
            <span class="caption label-select">Proyecto:</span>
            <select 
              class="df-select project-dropdown" 
              [ngModel]="devService.selectedProjectId()"
              (ngModelChange)="devService.selectProject($event)"
            >
              @for (proj of projectService.projects(); track proj.id) {
                <option [value]="proj.id">{{ proj.title }}</option>
              }
            </select>
          </div>

          <button type="button" class="df-btn df-btn-secondary" (click)="openLogTimeModal.set(true)">
            ⏱️ Registrar Horas
          </button>
          <button type="button" class="df-btn df-btn-primary" (click)="openAddPhaseModal.set(true)">
            + Nueva Fase
          </button>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="dev-metrics-grid">
        <div class="df-card dev-metric-card">
          <span class="caption">Horas Totales Registradas</span>
          <div class="metric-val mono">{{ currentProjectLoggedHours() }} hrs</div>
          <span class="caption sub-text">De {{ currentProjectEstimatedHours() }} hrs estimadas</span>
        </div>

        <div class="df-card dev-metric-card">
          <span class="caption">Eficiencia de Sprint</span>
          <div class="metric-val text-success">{{ sprintEfficiency() }}%</div>
          <span class="caption sub-text">Alineación con estimación</span>
        </div>

        <div class="df-card dev-metric-card">
          <span class="caption">Fases en Progreso</span>
          <div class="metric-val">{{ activePhasesCount() }}</div>
          <span class="caption sub-text">De {{ devService.projectPhases().length }} fases totales</span>
        </div>
      </div>

      <!-- Phases Timeline & Tasks Explorer -->
      <div class="phases-container">
        @for (phase of devService.projectPhases(); track phase.id) {
          <div class="df-card phase-card" [class.phase-completed]="phase.status === 'completed'">
            <div class="phase-header">
              <div class="phase-title-group">
                <span class="caption phase-lead">Lead: {{ phase.leadEngineer }}</span>
                <h3 class="headline-sm phase-name">{{ phase.phaseName }}</h3>
                <div class="phase-dates caption">
                  📅 {{ phase.startDate }} → {{ phase.endDate }}
                </div>
              </div>

              <div class="phase-status-group">
                <div class="hours-badge mono">
                  <strong>{{ phase.loggedHours }}</strong> / {{ phase.estimatedHours }} hrs
                </div>
                <app-status-badge [status]="phase.status"></app-status-badge>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="phase-progress-wrap">
              <app-progress-bar [value]="phase.progressPercentage" [showLabel]="true" height="8px"></app-progress-bar>
            </div>

            <!-- Tasks List -->
            <div class="tasks-section">
              <div class="tasks-header">
                <span class="label-md">Tareas del Sprint ({{ getDoneTasksCount(phase) }}/{{ phase.tasks.length }})</span>
                <button type="button" class="caption add-task-btn" (click)="openAddTask(phase.id)">
                  + Añadir Tarea
                </button>
              </div>

              @if (activeAddingTaskId() === phase.id) {
                <div class="add-task-inline">
                  <input type="text" class="df-input" placeholder="Nombre de la tarea técnica..." [(ngModel)]="newTaskTitle" />
                  <input type="text" class="df-input" style="width: 140px;" placeholder="Asignado a..." [(ngModel)]="newTaskAssignee" />
                  <input type="number" class="df-input" style="width: 80px;" placeholder="Horas" [(ngModel)]="newTaskHours" />
                  <button type="button" class="df-btn df-btn-sm df-btn-primary" (click)="saveTask(phase.id)">Guardar</button>
                  <button type="button" class="df-btn df-btn-sm df-btn-ghost" (click)="activeAddingTaskId.set(null)">✕</button>
                </div>
              }

              <div class="tasks-grid">
                @for (task of phase.tasks; track task.id) {
                  <div class="task-item" [class.task-done]="task.isDone">
                    <input 
                      type="checkbox" 
                      [checked]="task.isDone" 
                      (change)="devService.toggleTask(phase.id, task.id)"
                    />
                    <div class="task-info">
                      <span class="task-title">{{ task.title }}</span>
                      <span class="caption task-assignee">{{ task.assignee }} • {{ task.spentHours }}/{{ task.estimatedHours }} hrs</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="df-card empty-card">
            <h4 class="headline-sm">No hay fases configuradas para este proyecto</h4>
            <p class="caption">Crea la primera fase de desarrollo como Arquitectura, Frontend o Backend.</p>
            <button type="button" class="df-btn df-btn-primary" (click)="openAddPhaseModal.set(true)" style="margin-top: 1rem;">
              + Crear Fase Inicial
            </button>
          </div>
        }
      </div>

      <!-- Time Logs Audit Table -->
      <div class="df-card logs-table-card">
        <h3 class="headline-sm card-title">Bitácora de Horas Registradas</h3>
        <p class="caption card-desc">Registro detallado de actividades de desarrollo para el proyecto actual</p>

        <div class="df-table-container" style="margin-top: 1rem;">
          <table class="df-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ingeniero</th>
                <th>Horas</th>
                <th>Descripción del Trabajo</th>
              </tr>
            </thead>
            <tbody>
              @for (log of devService.projectTimeLogs(); track log.id) {
                <tr>
                  <td><span class="mono caption">{{ log.date }}</span></td>
                  <td><strong>{{ log.engineerName }}</strong></td>
                  <td><span class="mono text-primary font-bold">{{ log.hours }} hrs</span></td>
                  <td><span class="body-sm">{{ log.description }}</span></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="caption" style="text-align: center; padding: 2rem;">
                    No hay horas registradas en este proyecto todavía.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Registrar Horas -->
    <app-modal
      [isOpen]="openLogTimeModal()"
      title="Registrar Horas de Ingeniería"
      subtitle="Ingresa el tiempo invertido y las notas técnicas de la actividad"
      (close)="openLogTimeModal.set(false)"
    >
      <form (ngSubmit)="submitLogTime()" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Ingeniero / Desarrollador *</label>
            <input type="text" class="df-input" [(ngModel)]="newLog.engineerName" name="eng" required placeholder="Ej: Carlos Vega" />
          </div>
          <div class="form-group">
            <label class="df-label">Horas Invertidas *</label>
            <input type="number" step="0.5" class="df-input" [(ngModel)]="newLog.hours" name="hrs" required placeholder="6.5" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Fase de Desarrollo *</label>
          <select class="df-select" [(ngModel)]="newLog.phaseId" name="ph">
            @for (phase of devService.projectPhases(); track phase.id) {
              <option [value]="phase.id">{{ phase.phaseName }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label class="df-label">Descripción de Actividades Realizadas *</label>
          <textarea class="df-textarea" rows="3" [(ngModel)]="newLog.description" name="desc" required placeholder="Detalles de commits, optimizaciones, resolución de bugs..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openLogTimeModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Guardar Registro</button>
        </div>
      </form>
    </app-modal>

    <!-- Modal: Nueva Fase -->
    <app-modal
      [isOpen]="openAddPhaseModal()"
      title="Crear Nueva Fase de Desarrollo"
      subtitle="Añade un hito técnico al cronograma del proyecto"
      (close)="openAddPhaseModal.set(false)"
    >
      <form (ngSubmit)="submitNewPhase()" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Nombre de Fase *</label>
            <select class="df-select" [(ngModel)]="newPhaseData.phaseName" name="pname">
              <option value="Architecture & Specs">Architecture & Specs</option>
              <option value="Frontend Engineering">Frontend Engineering</option>
              <option value="Backend & AI Core">Backend & AI Core</option>
              <option value="Integrations & APIs">Integrations & APIs</option>
              <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Lead Engineer *</label>
            <input type="text" class="df-input" [(ngModel)]="newPhaseData.leadEngineer" name="plead" required placeholder="Ej: Dra. Sofía Luna" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Fecha de Inicio</label>
            <input type="date" class="df-input" [(ngModel)]="newPhaseData.startDate" name="ps" />
          </div>
          <div class="form-group">
            <label class="df-label">Fecha de Fin</label>
            <input type="date" class="df-input" [(ngModel)]="newPhaseData.endDate" name="pe" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Horas Estimadas</label>
          <input type="number" class="df-input" [(ngModel)]="newPhaseData.estimatedHours" name="peh" placeholder="60" />
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openAddPhaseModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Crear Fase</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .dev-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .dev-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .page-header {
        flex-direction: row;
        justify-content: space-between;
      }
    }

    .page-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    @media (min-width: 768px) {
      .page-title {
        font-size: 1.85rem;
      }
    }

    .page-subtitle {
      color: var(--df-text-secondary);
      font-size: 0.9rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      width: 100%;
    }

    @media (min-width: 768px) {
      .header-actions {
        width: auto;
      }
    }

    .project-selector-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--df-surface-container);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-default);
      padding: 0.2rem 0.65rem;
      width: 100%;
    }

    @media (min-width: 640px) {
      .project-selector-wrapper {
        width: auto;
      }
    }

    .label-select {
      color: var(--df-text-muted);
      font-weight: 600;
      white-space: nowrap;
    }

    .project-dropdown {
      border: none;
      background: transparent;
      padding: 0.4rem 0.5rem;
      width: 100%;
      min-width: 180px;
    }

    .dev-metrics-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .dev-metrics-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }
    }

    .dev-metric-card {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      background: linear-gradient(135deg, var(--df-surface-container) 0%, var(--df-surface-container-low) 100%);
    }

    .metric-val {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .sub-text {
      color: var(--df-text-muted);
    }

    .phases-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .phase-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background-color: var(--df-surface-container);
    }

    .phase-completed {
      border-color: rgba(107, 227, 161, 0.25);
    }

    .phase-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .phase-header {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }
    }

    .phase-lead {
      color: var(--df-primary);
      font-weight: 600;
    }

    .phase-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--df-text-primary);
      margin: 0.15rem 0;
    }

    .phase-dates {
      color: var(--df-text-muted);
    }

    .phase-status-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .hours-badge {
      background-color: var(--df-surface-container-high);
      padding: 0.35rem 0.75rem;
      border-radius: var(--df-radius-default);
      font-size: 0.85rem;
      color: var(--df-text-primary);
    }

    .phase-progress-wrap {
      margin: 0.25rem 0;
    }

    .tasks-section {
      background-color: var(--df-surface-container-low);
      border-radius: var(--df-radius-lg);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tasks-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .add-task-btn {
      background: none;
      border: none;
      color: var(--df-primary);
      cursor: pointer;
      font-weight: 600;
    }

    .add-task-inline {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }

    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.65rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background-color: var(--df-surface-container);
      padding: 0.65rem 0.85rem;
      border-radius: var(--df-radius-default);
    }

    .task-item.task-done .task-title {
      text-decoration: line-through;
      color: var(--df-text-muted);
    }

    .task-info {
      display: flex;
      flex-direction: column;
    }

    .task-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--df-text-primary);
    }

    .task-assignee {
      color: var(--df-text-muted);
      font-size: 0.7rem;
    }

    .empty-card {
      text-align: center;
      padding: 3rem;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class DevTimelineComponent {
  readonly devService = inject(DevelopmentService);
  readonly projectService = inject(ProjectService);
  readonly notificationService = inject(NotificationService);

  readonly openLogTimeModal = signal<boolean>(false);
  readonly openAddPhaseModal = signal<boolean>(false);
  readonly activeAddingTaskId = signal<string | null>(null);

  newTaskTitle = '';
  newTaskAssignee = 'Carlos Vega';
  newTaskHours = 10;

  newLog = {
    engineerName: 'Carlos Vega',
    hours: 6.0,
    phaseId: '',
    description: ''
  };

  newPhaseData = {
    phaseName: 'Frontend Engineering' as PhaseType,
    leadEngineer: 'David Salazar',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '2026-10-30',
    estimatedHours: 60,
    status: 'in_progress' as any
  };

  currentProjectLoggedHours(): number {
    return this.devService.projectPhases().reduce((acc, p) => acc + (p.loggedHours || 0), 0);
  }

  currentProjectEstimatedHours(): number {
    return this.devService.projectPhases().reduce((acc, p) => acc + (p.estimatedHours || 0), 0);
  }

  sprintEfficiency(): number {
    const est = this.currentProjectEstimatedHours();
    const log = this.currentProjectLoggedHours();
    if (!est) return 100;
    return Math.min(Math.round((log / est) * 100), 100);
  }

  activePhasesCount(): number {
    return this.devService.projectPhases().filter(p => p.status === 'in_progress').length;
  }

  getDoneTasksCount(phase: DevPhase): number {
    return phase.tasks.filter(t => t.isDone).length;
  }

  openAddTask(phaseId: string) {
    this.activeAddingTaskId.set(phaseId);
    this.newTaskTitle = '';
  }

  saveTask(phaseId: string) {
    if (!this.newTaskTitle.trim()) return;
    this.devService.addTask(phaseId, this.newTaskTitle.trim(), this.newTaskAssignee, this.newTaskHours);
    this.activeAddingTaskId.set(null);
    this.notificationService.success('Tarea Añadida', 'Tarea asignada al sprint de desarrollo.');
  }

  submitLogTime() {
    if (!this.newLog.description || !this.newLog.hours) {
      this.notificationService.error('Datos Faltantes', 'Ingresa la descripción y horas.');
      return;
    }

    const phases = this.devService.projectPhases();
    const targetPhaseId = this.newLog.phaseId || (phases.length ? phases[0].id : '');

    this.devService.logTime(
      this.devService.selectedProjectId(),
      targetPhaseId,
      this.newLog.engineerName,
      this.newLog.hours,
      this.newLog.description
    );

    this.openLogTimeModal.set(false);
    this.notificationService.success('Horas Registradas', `${this.newLog.hours} horas añadidas a la bitácora.`);
    this.newLog.description = '';
  }

  submitNewPhase() {
    this.devService.createPhase({
      projectId: this.devService.selectedProjectId(),
      phaseName: this.newPhaseData.phaseName,
      leadEngineer: this.newPhaseData.leadEngineer,
      startDate: this.newPhaseData.startDate,
      endDate: this.newPhaseData.endDate,
      estimatedHours: this.newPhaseData.estimatedHours,
      status: this.newPhaseData.status,
      tasks: []
    });

    this.openAddPhaseModal.set(false);
    this.notificationService.success('Fase Creada', `Fase "${this.newPhaseData.phaseName}" agregada al cronograma.`);
  }
}
