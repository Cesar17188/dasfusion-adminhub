import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';
import { Project, ProjectCategory, ProjectPriority, ProjectStatus } from '../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusBadgeComponent, 
    ProgressBarComponent, 
    ModalComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="projects-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">PROYECTOS & HUB</span>
            <span class="caption">Administración Integral</span>
          </div>
          <h1 class="headline-md page-title">Catálogo de Proyectos</h1>
          <p class="body-md page-subtitle">
            Revisión, especificaciones técnicas, control de presupuesto y asignación de requerimientos.
          </p>
        </div>

        <button type="button" class="df-btn df-btn-primary" (click)="openCreateModal.set(true)">
          + Nuevo Proyecto
        </button>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="controls-bar df-card">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Filtrar por título, cliente, tecnologías..." 
            class="df-input search-input"
            [ngModel]="projectService.searchQuery()"
            (ngModelChange)="projectService.searchQuery.set($event)"
          />
        </div>

        <div class="filters-group">
          <!-- Status Filter -->
          <select 
            class="df-select filter-select" 
            [ngModel]="projectService.statusFilter()" 
            (ngModelChange)="projectService.statusFilter.set($event)"
          >
            <option value="all">Todos los Estados</option>
            <option value="lead">Lead Hub</option>
            <option value="architecture">Arquitectura</option>
            <option value="development">En Desarrollo</option>
            <option value="testing">En Pruebas</option>
            <option value="delivery">Listo Entrega</option>
            <option value="completed">Completado</option>
          </select>

          <!-- Category Filter -->
          <select 
            class="df-select filter-select" 
            [ngModel]="projectService.categoryFilter()" 
            (ngModelChange)="projectService.categoryFilter.set($event)"
          >
            <option value="all">Todas las Categorías</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="Fullstack Web">Fullstack Web</option>
            <option value="Enterprise Cloud">Enterprise Cloud</option>
            <option value="Automation & Bots">Automation & Bots</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Data Engineering">Data Engineering</option>
          </select>

          <!-- View Mode Toggle -->
          <div class="view-toggle">
            <button 
              type="button" 
              class="df-btn-icon view-btn" 
              [class.active]="viewMode() === 'grid'"
              (click)="viewMode.set('grid')"
              title="Vista en Cuadrícula"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button 
              type="button" 
              class="df-btn-icon view-btn" 
              [class.active]="viewMode() === 'table'"
              (click)="viewMode.set('table')"
              title="Vista en Tabla"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Projects Grid View -->
      @if (viewMode() === 'grid') {
        <div class="projects-grid">
          @for (project of projectService.filteredProjects(); track project.id) {
            <div class="project-card df-card" (click)="openDetail(project)">
              <div class="card-header-line">
                <span class="category-chip">{{ project.category }}</span>
                <app-status-badge [status]="project.status"></app-status-badge>
              </div>

              <h3 class="headline-sm project-title">{{ project.title }}</h3>
              <span class="caption client-name">{{ project.clientCompany }} ({{ project.clientName }})</span>

              <p class="body-sm project-desc">{{ project.description }}</p>

              <!-- Tech Stack Badges -->
              <div class="tech-row">
                @for (tech of project.techStack; track tech) {
                  <span class="df-pill df-pill-primary tech-badge">{{ tech }}</span>
                }
              </div>

              <!-- Progress bar -->
              <div class="progress-section">
                <app-progress-bar [value]="project.progressPercentage" [showLabel]="true" height="8px"></app-progress-bar>
              </div>

              <!-- Card Footer -->
              <div class="card-footer">
                <div class="footer-stat">
                  <span class="caption">Presupuesto</span>
                  <strong class="mono">{{ project.budget | currency:project.currency:'symbol':'1.0-0' }}</strong>
                </div>
                <div class="footer-stat">
                  <span class="caption">Fecha Entrega</span>
                  <strong>{{ project.targetDeliveryDate }}</strong>
                </div>
                <div class="footer-stat">
                  <span class="caption">Prioridad</span>
                  <app-status-badge [status]="project.priority"></app-status-badge>
                </div>
              </div>
            </div>
          } @empty {
            <app-empty-state
              title="No se encontraron proyectos"
              description="No hay proyectos que coincidan con los filtros seleccionados."
              actionLabel="Limpiar Filtros"
              (action)="resetFilters()"
            ></app-empty-state>
          }
        </div>
      } @else {
        <!-- Projects Table View -->
        <div class="df-table-container">
          <table class="df-table">
            <thead>
              <tr>
                <th>Proyecto & Cliente</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Presupuesto</th>
                <th>Entrega Meta</th>
                <th>Progreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (project of projectService.filteredProjects(); track project.id) {
                <tr (click)="openDetail(project)" style="cursor: pointer;">
                  <td>
                    <div class="table-proj-title">
                      <strong>{{ project.title }}</strong>
                      <span class="caption">{{ project.clientCompany }} • {{ project.clientName }}</span>
                    </div>
                  </td>
                  <td><span class="caption category-chip">{{ project.category }}</span></td>
                  <td><app-status-badge [status]="project.priority"></app-status-badge></td>
                  <td><app-status-badge [status]="project.status"></app-status-badge></td>
                  <td><span class="mono">{{ project.budget | currency:project.currency:'symbol':'1.0-0' }}</span></td>
                  <td><span class="caption">{{ project.targetDeliveryDate }}</span></td>
                  <td style="width: 140px;">
                    <app-progress-bar [value]="project.progressPercentage" height="6px"></app-progress-bar>
                  </td>
                  <td>
                    <button type="button" class="df-btn df-btn-sm df-btn-secondary" (click)="$event.stopPropagation(); openDetail(project)">
                      Ver
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal Detalle & Requerimientos del Proyecto -->
    @if (selectedProject()) {
      <app-modal
        [isOpen]="isDetailOpen()"
        [title]="selectedProject()!.title"
        [subtitle]="selectedProject()!.clientCompany + ' • ' + selectedProject()!.category"
        maxWidth="800px"
        (close)="isDetailOpen.set(false)"
      >
        <div class="project-modal-content">
          <!-- Quick stats row -->
          <div class="modal-stats-grid">
            <div class="stat-cell">
              <span class="caption">Estado Actual</span>
              <app-status-badge [status]="selectedProject()!.status"></app-status-badge>
            </div>
            <div class="stat-cell">
              <span class="caption">Presupuesto</span>
              <strong class="mono">{{ selectedProject()!.budget | currency:selectedProject()!.currency:'symbol':'1.0-0' }}</strong>
            </div>
            <div class="stat-cell">
              <span class="caption">Lead Dev Asignado</span>
              <strong>{{ selectedProject()!.assignedLeadDev || 'Por Asignar' }}</strong>
            </div>
            <div class="stat-cell">
              <span class="caption">QA Lead</span>
              <strong>{{ selectedProject()!.assignedQALead || 'Por Asignar' }}</strong>
            </div>
          </div>

          <div class="modal-section">
            <h4 class="section-title">Descripción y Especificaciones</h4>
            <p class="body-sm">{{ selectedProject()!.description }}</p>
          </div>

          <!-- Requirements Checklist -->
          <div class="modal-section">
            <div class="section-header-row">
              <h4 class="section-title">Requerimientos Técnicos</h4>
              <button type="button" class="df-btn df-btn-sm df-btn-secondary" (click)="isAddingReq.set(!isAddingReq())">
                + Agregar Requerimiento
              </button>
            </div>

            @if (isAddingReq()) {
              <div class="add-req-box">
                <input 
                  type="text" 
                  class="df-input" 
                  placeholder="Ej: Implementar autenticación OAuth 2.0 y biometría..." 
                  [(ngModel)]="newReqTitle"
                />
                <button type="button" class="df-btn df-btn-primary" (click)="saveNewRequirement()">Guardar</button>
              </div>
            }

            <div class="requirements-list">
              @for (req of selectedProject()!.requirements; track req.id) {
                <div class="req-row" [class.req-done]="req.isCompleted">
                  <input 
                    type="checkbox" 
                    [checked]="req.isCompleted" 
                    (change)="projectService.toggleRequirement(selectedProject()!.id, req.id)"
                  />
                  <span class="req-text">{{ req.title }}</span>
                  <span class="df-pill df-pill-neutral">{{ req.priority === 'must_have' ? 'Mandatorio' : 'Opcional' }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Change Status Action -->
          <div class="modal-section">
            <h4 class="section-title">Modificar Fase de Ciclo</h4>
            <div class="status-change-buttons">
              @for (st of ['lead', 'architecture', 'development', 'testing', 'delivery', 'completed']; track st) {
                <button 
                  type="button" 
                  class="df-btn df-btn-sm" 
                  [class.df-btn-primary]="selectedProject()!.status === st"
                  [class.df-btn-ghost]="selectedProject()!.status !== st"
                  (click)="updateStatus(selectedProject()!.id, st)"
                >
                  {{ st }}
                </button>
              }
            </div>
          </div>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-danger" (click)="deleteProject(selectedProject()!.id)">
            Eliminar
          </button>
          <button type="button" class="df-btn df-btn-primary" (click)="isDetailOpen.set(false)">
            Cerrar
          </button>
        </div>
      </app-modal>
    }

    <!-- Modal Crear Proyecto -->
    <app-modal
      [isOpen]="openCreateModal()"
      title="Registrar Nuevo Proyecto"
      subtitle="Inicializa un proyecto con requerimientos y asignación técnica"
      (close)="openCreateModal.set(false)"
    >
      <form (ngSubmit)="createProjectSubmit()" class="create-proj-form">
        <div class="form-group">
          <label class="df-label">Título del Proyecto *</label>
          <input type="text" class="df-input" [(ngModel)]="newProj.title" name="t" required placeholder="Ej: FleetMind Routing Engine" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Cliente *</label>
            <select class="df-select" [(ngModel)]="newProj.clientId" name="c" (change)="onClientChange($event)">
              @for (client of clientService.clients(); track client.id) {
                <option [value]="client.id">{{ client.name }} ({{ client.company }})</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Categoría *</label>
            <select class="df-select" [(ngModel)]="newProj.category" name="cat">
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Fullstack Web">Fullstack Web</option>
              <option value="Enterprise Cloud">Enterprise Cloud</option>
              <option value="Automation & Bots">Automation & Bots</option>
              <option value="Mobile App">Mobile App</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Presupuesto (USD)</label>
            <input type="number" class="df-input" [(ngModel)]="newProj.budget" name="b" placeholder="45000" />
          </div>
          <div class="form-group">
            <label class="df-label">Prioridad</label>
            <select class="df-select" [(ngModel)]="newProj.priority" name="prio">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Fecha de Entrega Objetivo</label>
            <input type="date" class="df-input" [(ngModel)]="newProj.targetDeliveryDate" name="tdd" />
          </div>
          <div class="form-group">
            <label class="df-label">Lead Dev Asignado</label>
            <input type="text" class="df-input" [(ngModel)]="newProj.assignedLeadDev" name="dev" placeholder="Ing. Carlos Vega" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Descripción</label>
          <textarea class="df-textarea" rows="3" [(ngModel)]="newProj.description" name="desc" placeholder="Detalles de la solución técnica..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openCreateModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Guardar Proyecto</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .projects-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
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

    .controls-bar {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 1rem;
      gap: 0.75rem;
    }

    @media (min-width: 768px) {
      .controls-bar {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
      }
    }

    .search-box {
      position: relative;
      flex: 1;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--df-text-muted);
    }

    .search-input {
      padding-left: 2.25rem;
    }

    .filters-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      width: 100%;
    }

    @media (min-width: 768px) {
      .filters-group {
        width: auto;
      }
    }

    .filter-select {
      flex: 1;
      min-width: 140px;
    }

    .view-toggle {
      display: flex;
      background-color: var(--df-surface-container-low);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-default);
      padding: 2px;
    }

    .view-btn {
      width: 32px;
      height: 32px;
      color: var(--df-text-muted);
      border-radius: var(--df-radius-sm);
    }

    .view-btn.active {
      background-color: var(--df-surface-container-highest);
      color: var(--df-primary);
    }

    .projects-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    @media (min-width: 640px) {
      .projects-grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      }
    }

    .project-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      cursor: pointer;
      transition: all var(--df-transition-normal);
      background-color: var(--df-surface-container);
    }

    .project-card:hover {
      border-color: var(--df-primary);
      transform: translateY(-3px);
      box-shadow: var(--df-shadow-md);
    }

    .card-header-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .category-chip {
      background-color: var(--df-surface-container-high);
      color: var(--df-primary);
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: var(--df-radius-sm);
    }

    .project-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--df-text-primary);
      line-height: 1.3;
    }

    .client-name {
      color: var(--df-on-surface-variant);
      margin-top: -0.4rem;
    }

    .project-desc {
      color: var(--df-text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }

    .tech-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .tech-badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
    }

    .progress-section {
      margin: 0.35rem 0;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--df-border-subtle);
    }

    .footer-stat {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      font-size: 0.8rem;
    }

    .table-proj-title {
      display: flex;
      flex-direction: column;
    }

    /* Modal styles */
    .project-modal-content {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .modal-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      background-color: var(--df-surface-container-low);
      padding: 1rem;
      border-radius: var(--df-radius-lg);
    }

    @media (min-width: 640px) {
      .modal-stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .stat-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .modal-section {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .section-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--df-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .add-req-box {
      display: flex;
      gap: 0.5rem;
    }

    .requirements-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .req-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.85rem;
      background-color: var(--df-surface-container-low);
      border-radius: var(--df-radius-default);
    }

    .req-row.req-done .req-text {
      text-decoration: line-through;
      color: var(--df-text-muted);
    }

    .req-text {
      flex: 1;
      font-size: 0.85rem;
    }

    .status-change-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .create-proj-form {
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
export class ProjectListComponent {
  readonly projectService = inject(ProjectService);
  readonly clientService = inject(ClientService);
  readonly notificationService = inject(NotificationService);

  readonly viewMode = signal<'grid' | 'table'>('grid');
  readonly selectedProject = signal<Project | null>(null);
  readonly isDetailOpen = signal<boolean>(false);
  readonly openCreateModal = signal<boolean>(false);
  readonly isAddingReq = signal<boolean>(false);
  newReqTitle = '';

  newProj = {
    title: '',
    clientId: 'cli-01',
    clientName: 'Alejandro Morales',
    clientCompany: 'Nexus Logistics AI',
    description: '',
    category: 'AI & Machine Learning' as ProjectCategory,
    status: 'lead' as ProjectStatus,
    priority: 'high' as ProjectPriority,
    budget: 45000,
    currency: 'USD' as any,
    startDate: new Date().toISOString().substring(0, 10),
    targetDeliveryDate: '2026-11-30',
    assignedLeadDev: 'Ing. Carlos Vega',
    techStack: ['Angular 21', 'Python FastApi', 'Supabase'],
    requirements: []
  };

  openDetail(project: Project) {
    this.selectedProject.set(project);
    this.isDetailOpen.set(true);
  }

  resetFilters() {
    this.projectService.searchQuery.set('');
    this.projectService.statusFilter.set('all');
    this.projectService.categoryFilter.set('all');
    this.projectService.priorityFilter.set('all');
  }

  saveNewRequirement() {
    if (!this.newReqTitle.trim() || !this.selectedProject()) return;
    this.projectService.addRequirement(this.selectedProject()!.id, this.newReqTitle.trim());
    this.selectedProject.set(this.projectService.getProjectById(this.selectedProject()!.id) || null);
    this.newReqTitle = '';
    this.isAddingReq.set(false);
    this.notificationService.success('Requerimiento Agregado', 'Requisito añadido a la especificación.');
  }

  updateStatus(projectId: string, status: any) {
    this.projectService.updateProjectStatus(projectId, status);
    this.selectedProject.set(this.projectService.getProjectById(projectId) || null);
    this.notificationService.info('Estado Actualizado', `Fase cambiada a ${status.toUpperCase()}`);
  }

  deleteProject(id: string) {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.projectService.deleteProject(id);
      this.isDetailOpen.set(false);
      this.notificationService.warning('Proyecto Eliminado', 'El proyecto fue retirado del pipeline.');
    }
  }

  onClientChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    const client = this.clientService.getClientById(id);
    if (client) {
      this.newProj.clientName = client.name;
      this.newProj.clientCompany = client.company;
    }
  }

  createProjectSubmit() {
    if (!this.newProj.title) {
      this.notificationService.error('Título Obligatorio', 'Ingresa el nombre del proyecto.');
      return;
    }
    this.projectService.createProject(this.newProj);
    this.openCreateModal.set(false);
    this.notificationService.success('Proyecto Creado', `Proyecto "${this.newProj.title}" creado con éxito.`);
    this.newProj.title = '';
    this.newProj.description = '';
  }
}
