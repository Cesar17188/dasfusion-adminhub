import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { Project, ProjectStatus } from '../../core/models/project.model';

interface KanbanColumn {
  id: ProjectStatus;
  title: string;
  subtitle: string;
  count: () => number;
  projects: () => Project[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, ProgressBarComponent, ModalComponent],
  template: `
    <div class="kanban-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">WORKFLOW ÁGIL</span>
            <span class="caption">Flujo Operativo de DASFusion</span>
          </div>
          <h1 class="headline-md page-title">Tablero Kanban de Proyectos</h1>
          <p class="body-md page-subtitle">
            Administra el ciclo de vida de los proyectos desde la recepción de la propuesta en DASFusion-hub hasta el despliegue final.
          </p>
        </div>

        <div class="header-stats">
          <div class="stat-pill">
            <span class="caption">Total en Flujo:</span>
            <strong>{{ projectService.totalProjects() }}</strong>
          </div>
          <div class="stat-pill">
            <span class="caption">Pipeline:</span>
            <strong>{{ projectService.totalPipelineBudget() | currency:'USD':'symbol':'1.0-0' }}</strong>
          </div>
        </div>
      </div>

      <!-- Kanban Columns Container -->
      <div class="kanban-columns-container custom-scrollbar">
        @for (col of columns; track col.id) {
          <div class="kanban-column" [class.col-active]="col.id === 'development'">
            <!-- Column Header -->
            <div class="column-header">
              <div class="col-title-group">
                <span class="column-title">{{ col.title }}</span>
                <span class="col-counter">{{ col.count() }}</span>
              </div>
              <span class="caption col-sub">{{ col.subtitle }}</span>
            </div>

            <!-- Column Cards Drop Zone -->
            <div class="cards-list custom-scrollbar">
              @for (project of col.projects(); track project.id) {
                <div class="kanban-card df-card" (click)="openProjectDetail(project)">
                  <div class="card-top-row">
                    <span class="caption client-badge">{{ project.clientCompany }}</span>
                    <app-status-badge [status]="project.priority"></app-status-badge>
                  </div>

                  <h4 class="card-project-title">{{ project.title }}</h4>
                  <p class="caption card-desc-snippet">{{ project.description }}</p>

                  <div class="tech-stack-row">
                    @for (tech of project.techStack.slice(0, 3); track tech) {
                      <span class="df-pill df-pill-neutral mini-pill">{{ tech }}</span>
                    }
                    @if (project.techStack.length > 3) {
                      <span class="df-pill df-pill-neutral mini-pill">+{{ project.techStack.length - 3 }}</span>
                    }
                  </div>

                  <div class="card-progress-box">
                    <app-progress-bar [value]="project.progressPercentage" [showLabel]="true" height="6px"></app-progress-bar>
                  </div>

                  <div class="card-footer-row">
                    <span class="mono card-budget">{{ project.budget | currency:project.currency:'symbol':'1.0-0' }}</span>
                    
                    <div class="action-buttons-group" (click)="$event.stopPropagation()">
                      @if (getPreviousStatus(project.status)) {
                        <button 
                          type="button" 
                          class="df-btn-icon df-btn-ghost move-btn" 
                          (click)="moveProject(project, getPreviousStatus(project.status)!)"
                          title="Mover a etapa anterior"
                        >
                          ←
                        </button>
                      }
                      @if (getNextStatus(project.status)) {
                        <button 
                          type="button" 
                          class="df-btn-icon df-btn-accent move-btn" 
                          (click)="moveProject(project, getNextStatus(project.status)!)"
                          title="Avanzar de etapa"
                        >
                          →
                        </button>
                      }
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="empty-column-state">
                  <span class="caption">Sin proyectos en esta fase</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal Detalle Proyecto -->
    @if (selectedProject()) {
      <app-modal
        [isOpen]="isDetailOpen()"
        [title]="selectedProject()!.title"
        [subtitle]="selectedProject()!.clientCompany + ' • ' + selectedProject()!.clientName"
        maxWidth="750px"
        (close)="isDetailOpen.set(false)"
      >
        <div class="project-modal-body">
          <div class="detail-hero-grid">
            <div class="detail-box">
              <span class="caption">Categoría:</span>
              <strong>{{ selectedProject()!.category }}</strong>
            </div>
            <div class="detail-box">
              <span class="caption">Presupuesto:</span>
              <strong class="mono">{{ selectedProject()!.budget | currency:selectedProject()!.currency:'symbol':'1.0-0' }}</strong>
            </div>
            <div class="detail-box">
              <span class="caption">Lead Score Hub:</span>
              <strong class="text-primary">{{ selectedProject()!.leadScore || 90 }}/100</strong>
            </div>
            <div class="detail-box">
              <span class="caption">Fecha de Entrega:</span>
              <strong>{{ selectedProject()!.targetDeliveryDate }}</strong>
            </div>
          </div>

          <div class="detail-section">
            <h5 class="section-heading">Descripción del Alcance</h5>
            <p class="body-sm">{{ selectedProject()!.description }}</p>
          </div>

          <div class="detail-section">
            <h5 class="section-heading">Stack Tecnológico</h5>
            <div class="tech-stack-row">
              @for (tech of selectedProject()!.techStack; track tech) {
                <span class="df-pill df-pill-primary">{{ tech }}</span>
              }
            </div>
          </div>

          <div class="detail-section">
            <h5 class="section-heading">Requerimientos Clave ({{ getCompletedReqs(selectedProject()!) }}/{{ selectedProject()!.requirements.length }})</h5>
            <div class="requirements-checklist">
              @for (req of selectedProject()!.requirements; track req.id) {
                <label class="req-item" [class.checked]="req.isCompleted">
                  <input 
                    type="checkbox" 
                    [checked]="req.isCompleted" 
                    (change)="projectService.toggleRequirement(selectedProject()!.id, req.id)"
                  />
                  <span class="req-title">{{ req.title }}</span>
                  <span class="caption req-prio">{{ req.priority === 'must_have' ? 'Must-have' : 'Nice-to-have' }}</span>
                </label>
              }
            </div>
          </div>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-secondary" (click)="isDetailOpen.set(false)">Cerrar</button>
        </div>
      </app-modal>
    }
  `,
  styles: [`
    .kanban-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: calc(100vh - 120px);
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .page-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .page-title {
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .page-subtitle {
      color: var(--df-text-secondary);
      max-width: 650px;
      font-size: 0.9rem;
    }

    .header-stats {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-pill {
      background-color: var(--df-surface-container);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-lg);
      padding: 0.5rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
    }

    .kanban-columns-container {
      display: flex;
      gap: 1.25rem;
      flex: 1;
      overflow-x: auto;
      padding-bottom: 1rem;
      align-items: stretch;
    }

    .kanban-column {
      flex: 0 0 320px;
      background-color: var(--df-surface-container-low);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: 100%;
    }

    .kanban-column.col-active {
      border-color: rgba(174, 199, 247, 0.35);
      background-color: rgba(26, 27, 30, 0.85);
    }

    .column-header {
      padding: 1.15rem 1.25rem 0.85rem;
      border-bottom: 1px solid var(--df-border-subtle);
      background-color: var(--df-surface-container);
    }

    .col-title-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.2rem;
    }

    .column-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .col-counter {
      background-color: var(--df-surface-container-highest);
      color: var(--df-primary);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.55rem;
      border-radius: var(--df-radius-full);
    }

    .col-sub {
      color: var(--df-text-muted);
      font-size: 0.7rem;
    }

    .cards-list {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
      overflow-y: auto;
    }

    .kanban-card {
      padding: 1.15rem;
      background-color: var(--df-surface-container);
      cursor: pointer;
      border-radius: var(--df-radius-lg);
      border: 1px solid var(--df-border-subtle);
      transition: all var(--df-transition-fast);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .kanban-card:hover {
      border-color: var(--df-primary);
      transform: translateY(-2px);
      box-shadow: var(--df-shadow-md);
    }

    .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .client-badge {
      color: var(--df-primary);
      font-weight: 600;
    }

    .card-project-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--df-text-primary);
      line-height: 1.3;
    }

    .card-desc-snippet {
      color: var(--df-on-surface-variant);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .tech-stack-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .mini-pill {
      font-size: 0.65rem;
      padding: 0.15rem 0.45rem;
    }

    .card-progress-box {
      margin: 0.25rem 0;
    }

    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.5rem;
      border-top: 1px solid var(--df-border-subtle);
    }

    .card-budget {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .action-buttons-group {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .move-btn {
      width: 28px;
      height: 28px;
      font-size: 0.85rem;
    }

    .empty-column-state {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--df-text-muted);
      border: 1px dashed var(--df-border-subtle);
      border-radius: var(--df-radius-lg);
    }

    /* Modal Styling */
    .project-modal-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .detail-hero-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.85rem;
    }

    .detail-box {
      background-color: var(--df-surface-container-low);
      padding: 0.75rem 1rem;
      border-radius: var(--df-radius-default);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .section-heading {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--df-on-surface-variant);
    }

    .requirements-checklist {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .req-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      background-color: var(--df-surface-container-low);
      border-radius: var(--df-radius-default);
      cursor: pointer;
    }

    .req-item.checked .req-title {
      text-decoration: line-through;
      color: var(--df-text-muted);
    }

    .req-title {
      flex: 1;
      font-size: 0.875rem;
    }

    .req-prio {
      color: var(--df-primary);
    }
  `]
})
export class KanbanBoardComponent {
  readonly projectService = inject(ProjectService);
  readonly notificationService = inject(NotificationService);

  readonly selectedProject = signal<Project | null>(null);
  readonly isDetailOpen = signal<boolean>(false);

  readonly columns: KanbanColumn[] = [
    {
      id: 'lead',
      title: 'Leads Hub',
      subtitle: 'Propuestas recibidas',
      count: () => this.projectService.projectsLead().length,
      projects: () => this.projectService.projectsLead()
    },
    {
      id: 'architecture',
      title: 'Arquitectura & Specs',
      subtitle: 'Diseño técnico y UI',
      count: () => this.projectService.projectsArchitecture().length,
      projects: () => this.projectService.projectsArchitecture()
    },
    {
      id: 'development',
      title: 'En Desarrollo',
      subtitle: 'Sprints activos',
      count: () => this.projectService.projectsDevelopment().length,
      projects: () => this.projectService.projectsDevelopment()
    },
    {
      id: 'testing',
      title: 'Pruebas QA & UAT',
      subtitle: 'Validación y seguridad',
      count: () => this.projectService.projectsTesting().length,
      projects: () => this.projectService.projectsTesting()
    },
    {
      id: 'delivery',
      title: 'Listo para Entrega',
      subtitle: 'Releases & Sign-off',
      count: () => this.projectService.projectsDelivery().length,
      projects: () => this.projectService.projectsDelivery()
    },
    {
      id: 'completed',
      title: 'Completado',
      subtitle: 'Proyectos finalizados',
      count: () => this.projectService.projectsCompleted().length,
      projects: () => this.projectService.projectsCompleted()
    }
  ];

  private readonly statusFlow: ProjectStatus[] = [
    'lead',
    'architecture',
    'development',
    'testing',
    'delivery',
    'completed'
  ];

  getNextStatus(current: ProjectStatus): ProjectStatus | null {
    const idx = this.statusFlow.indexOf(current);
    if (idx !== -1 && idx < this.statusFlow.length - 1) {
      return this.statusFlow[idx + 1];
    }
    return null;
  }

  getPreviousStatus(current: ProjectStatus): ProjectStatus | null {
    const idx = this.statusFlow.indexOf(current);
    if (idx > 0) {
      return this.statusFlow[idx - 1];
    }
    return null;
  }

  moveProject(project: Project, newStatus: ProjectStatus) {
    this.projectService.updateProjectStatus(project.id, newStatus);
    this.notificationService.info(
      'Estado Actualizado',
      `"${project.title}" movido a ${newStatus.toUpperCase()}`
    );
  }

  openProjectDetail(project: Project) {
    this.selectedProject.set(project);
    this.isDetailOpen.set(true);
  }

  getCompletedReqs(project: Project): number {
    return project.requirements.filter(r => r.isCompleted).length;
  }
}
