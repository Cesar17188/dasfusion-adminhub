import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { DevelopmentService } from '../../core/services/development.service';
import { QaService } from '../../core/services/qa.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { NotificationService } from '../../core/services/notification.service';
import { Project, ProjectCategory } from '../../core/models/project.model';
import { Client } from '../../core/models/client.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    StatCardComponent, 
    StatusBadgeComponent, 
    ProgressBarComponent,
    ModalComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Hero Banner -->
      <div class="hero-banner df-card df-card-highlight">
        <div class="hero-content">
          <div class="hero-tag">
            <span class="df-pill df-pill-primary">PANEL EJECUTIVO</span>
            <span class="caption date-chip">{{ todayDate }}</span>
          </div>
          <h1 class="headline-md hero-title">Centro de Control DASFusion Core</h1>
          <p class="body-md hero-subtitle">
            Monitoreo en tiempo real de proyectos, clientes recibidos desde <strong>DASFusion-hub</strong> y métricas de ingeniería.
          </p>
        </div>
        <div class="hero-actions">
          <button type="button" class="df-btn df-btn-secondary" (click)="openNewClientModal.set(true)">
            + Nuevo Cliente
          </button>
          <button type="button" class="df-btn df-btn-primary" (click)="openNewProjectModal.set(true)">
            + Crear Proyecto
          </button>
        </div>
      </div>

      <!-- Key Performance Metrics Grid -->
      <div class="stats-grid">
        <app-stat-card
          label="Pipeline de Proyectos"
          [value]="projectService.totalPipelineBudget() | currency:'USD':'symbol':'1.0-0'"
          badge="Total Activo"
          badgeType="primary"
          [description]="projectService.activeProjectsCount() + ' proyectos en ejecución'"
          trend="18.5% vs mes anterior"
          [isTrendPositive]="true"
          variant="primary"
        ></app-stat-card>

        <app-stat-card
          label="Clientes & Leads Hub"
          [value]="clientService.totalClients()"
          [badge]="clientService.leadsCount() + ' Nuevos'"
          badgeType="warning"
          [description]="clientService.activeClientsCount() + ' clientes con contratos activos'"
          variant="tertiary"
        ></app-stat-card>

        <app-stat-card
          label="Horas de Ingeniería"
          [value]="devService.totalLoggedHours() + ' hrs'"
          badge="Desarrollo"
          badgeType="neutral"
          [description]="'De ' + devService.totalEstimatedHours() + ' hrs estimadas totales'"
        ></app-stat-card>

        <app-stat-card
          label="Calidad & QA Pass Rate"
          [value]="qaService.passRate() + '%'"
          badge="Testing"
          badgeType="success"
          [description]="qaService.openBugsCount() + ' bugs activos (' + qaService.criticalBugsCount() + ' críticos)'"
          variant="success"
        ></app-stat-card>
      </div>

      <!-- Pipeline Flow & Upcoming Deliveries Row -->
      <div class="dashboard-two-col">
        <!-- Project Pipeline Stages Breakdown -->
        <div class="df-card pipeline-card">
          <div class="card-header">
            <div>
              <h3 class="headline-sm card-title">Distribución por Etapas de Ciclo</h3>
              <p class="caption card-desc">Flujo de software desde lead hasta entrega</p>
            </div>
            <a routerLink="/kanban" class="caption view-all-link">Ver Kanban →</a>
          </div>

          <div class="pipeline-stages-grid">
            <div class="stage-box" [routerLink]="['/kanban']">
              <span class="caption stage-name">Leads Hub</span>
              <span class="stage-count">{{ projectService.projectsLead().length }}</span>
              <span class="caption stage-sub">Propuestas</span>
            </div>
            <div class="stage-box" [routerLink]="['/kanban']">
              <span class="caption stage-name">Arquitectura</span>
              <span class="stage-count">{{ projectService.projectsArchitecture().length }}</span>
              <span class="caption stage-sub">Specs & UI</span>
            </div>
            <div class="stage-box active-stage" [routerLink]="['/kanban']">
              <span class="caption stage-name">Desarrollo</span>
              <span class="stage-count">{{ projectService.projectsDevelopment().length }}</span>
              <span class="caption stage-sub">Sprints</span>
            </div>
            <div class="stage-box" [routerLink]="['/kanban']">
              <span class="caption stage-name">Pruebas QA</span>
              <span class="stage-count">{{ projectService.projectsTesting().length }}</span>
              <span class="caption stage-sub">Validación</span>
            </div>
            <div class="stage-box" [routerLink]="['/kanban']">
              <span class="caption stage-name">Entregas</span>
              <span class="stage-count">{{ projectService.projectsDelivery().length }}</span>
              <span class="caption stage-sub">Releases</span>
            </div>
          </div>

          <!-- Overall Pipeline Progress -->
          <div class="pipeline-progress-section">
            <app-progress-bar 
              [value]="projectService.averageProgress()" 
              label="Progreso Promedio de Proyectos Activos"
              height="10px"
            ></app-progress-bar>
          </div>
        </div>

        <!-- Upcoming Deliveries & Milestones -->
        <div class="df-card deliveries-widget">
          <div class="card-header">
            <div>
              <h3 class="headline-sm card-title">Próximas Entregas & Releases</h3>
              <p class="caption card-desc">Hitos con compromiso de entrega</p>
            </div>
            <a routerLink="/deliveries" class="caption view-all-link">Ver Cronograma →</a>
          </div>

          <div class="deliveries-list">
            @for (milestone of deliveryService.upcomingMilestones(); track milestone.id) {
              <div class="milestone-item">
                <div class="milestone-info">
                  <div class="milestone-header-line">
                    <span class="milestone-version mono">{{ milestone.releaseVersion }}</span>
                    <app-status-badge [status]="milestone.status"></app-status-badge>
                  </div>
                  <h4 class="milestone-title">{{ milestone.milestoneTitle }}</h4>
                  <div class="milestone-meta">
                    <span class="caption date-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 14 14"></polyline>
                      </svg>
                      Entrega: {{ milestone.dueDate }}
                    </span>
                    <span class="caption checklist-count">
                      {{ getCompletedChecklistCount(milestone) }}/{{ milestone.checklist.length }} Checklist
                    </span>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="caption empty-msg">No hay entregas pendientes registradas.</p>
            }
          </div>
        </div>
      </div>

      <!-- Active Projects Table & Recent Hub Submissions -->
      <div class="dashboard-two-col" style="margin-top: 1.5rem;">
        <!-- Active Projects List -->
        <div class="df-card projects-table-card">
          <div class="card-header">
            <div>
              <h3 class="headline-sm card-title">Proyectos en Curso</h3>
              <p class="caption card-desc">Estado actual de desarrollo e ingeniería</p>
            </div>
            <a routerLink="/projects" class="caption view-all-link">Ver Todos ({{ projectService.projects().length }}) →</a>
          </div>

          <div class="df-table-container">
            <table class="df-table">
              <thead>
                <tr>
                  <th>Proyecto / Cliente</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Presupuesto</th>
                </tr>
              </thead>
              <tbody>
                @for (project of projectService.projects(); track project.id) {
                  <tr>
                    <td>
                      <div class="project-title-cell">
                        <span class="project-name">{{ project.title }}</span>
                        <span class="caption client-sub">{{ project.clientCompany }} • {{ project.clientName }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="caption category-tag">{{ project.category }}</span>
                    </td>
                    <td>
                      <app-status-badge [status]="project.status"></app-status-badge>
                    </td>
                    <td style="width: 140px;">
                      <app-progress-bar [value]="project.progressPercentage" [showLabel]="true" height="6px"></app-progress-bar>
                    </td>
                    <td>
                      <span class="mono budget-cell">{{ project.budget | currency:project.currency:'symbol':'1.0-0' }}</span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="caption" style="text-align: center; padding: 2rem; color: var(--df-text-muted);">
                      No hay proyectos registrados aún en la base de datos.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Leads from DASFusion-hub -->
        <div class="df-card hub-leads-card">
          <div class="card-header">
            <div>
              <h3 class="headline-sm card-title">Leads Recientes DASFusion-hub</h3>
              <p class="caption card-desc">Clientes potenciales enviados por la web</p>
            </div>
            <a routerLink="/clients" class="caption view-all-link">Ver Clientes →</a>
          </div>

          <div class="leads-list">
            @for (client of clientService.clients(); track client.id) {
              <div class="lead-item">
                <div class="lead-avatar">{{ client.name.charAt(0) }}</div>
                <div class="lead-details">
                  <div class="lead-header-row">
                    <span class="lead-name">{{ client.name }}</span>
                    <app-status-badge [status]="client.status"></app-status-badge>
                  </div>
                  <span class="caption lead-company">{{ client.company }} • {{ client.country }}</span>
                  @if (client.hubMessage) {
                    <p class="caption lead-msg">"{{ client.hubMessage }}"</p>
                  }
                  <div class="lead-meta-row">
                    <span class="caption budget-pill">Presupuesto: {{ client.totalBudget | currency:'USD':'symbol':'1.0-0' }}</span>
                    <span class="caption source-pill">{{ client.source }}</span>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="caption empty-msg" style="padding: 1.5rem; text-align: center; color: var(--df-text-muted);">
                Sin leads recientes en la base de datos Supabase.
              </p>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nuevo Cliente -->
    <app-modal 
      [isOpen]="openNewClientModal()" 
      title="Registrar Nuevo Cliente / Lead"
      subtitle="Ingresa la información del cliente o propuesta de DASFusion-hub"
      (close)="openNewClientModal.set(false)"
    >
      <form (ngSubmit)="saveClient()" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Nombre del Contacto *</label>
            <input type="text" class="df-input" [(ngModel)]="newClientData.name" name="cname" required placeholder="Ej: Roberto Gómez" />
          </div>
          <div class="form-group">
            <label class="df-label">Empresa *</label>
            <input type="text" class="df-input" [(ngModel)]="newClientData.company" name="ccompany" required placeholder="Ej: Tech Innovators Inc." />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Email Corporativo *</label>
            <input type="email" class="df-input" [(ngModel)]="newClientData.email" name="cemail" required placeholder="rgomez@techinnovators.com" />
          </div>
          <div class="form-group">
            <label class="df-label">Teléfono</label>
            <input type="text" class="df-input" [(ngModel)]="newClientData.phone" name="cphone" placeholder="+1 (555) 000-0000" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Estado</label>
            <select class="df-select" [(ngModel)]="newClientData.status" name="cstatus">
              <option value="lead">Lead / Propuesta Hub</option>
              <option value="contacted">Contactado</option>
              <option value="negotiation">En Negociación</option>
              <option value="active">Cliente Activo</option>
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Presupuesto Estimado (USD)</label>
            <input type="number" class="df-input" [(ngModel)]="newClientData.totalBudget" name="cbudget" placeholder="50000" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Mensaje / Requerimiento enviado en el Hub</label>
          <textarea class="df-textarea" rows="3" [(ngModel)]="newClientData.hubMessage" name="chubmsg" placeholder="Descripción de las necesidades de software o IA..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openNewClientModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Guardar Cliente</button>
        </div>
      </form>
    </app-modal>

    <!-- Modal: Nuevo Proyecto -->
    <app-modal
      [isOpen]="openNewProjectModal()"
      title="Crear Nuevo Proyecto"
      subtitle="Inicializa un proyecto con requerimientos y asignación técnica"
      (close)="openNewProjectModal.set(false)"
    >
      <form (ngSubmit)="saveProject()" class="modal-form">
        <div class="form-group">
          <label class="df-label">Título del Proyecto *</label>
          <input type="text" class="df-input" [(ngModel)]="newProjectData.title" name="ptitle" required placeholder="Ej: AI Neural Search Engine" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Cliente Asociado *</label>
            <select class="df-select" [(ngModel)]="newProjectData.clientId" name="pclient" (change)="onProjectClientSelect($event)">
              @for (client of clientService.clients(); track client.id) {
                <option [value]="client.id">{{ client.name }} ({{ client.company }})</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Categoría *</label>
            <select class="df-select" [(ngModel)]="newProjectData.category" name="pcat">
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Fullstack Web">Fullstack Web</option>
              <option value="Enterprise Cloud">Enterprise Cloud</option>
              <option value="Automation & Bots">Automation & Bots</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Data Engineering">Data Engineering</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Presupuesto (USD)</label>
            <input type="number" class="df-input" [(ngModel)]="newProjectData.budget" name="pbudget" placeholder="45000" />
          </div>
          <div class="form-group">
            <label class="df-label">Prioridad</label>
            <select class="df-select" [(ngModel)]="newProjectData.priority" name="ppriority">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Fecha de Inicio</label>
            <input type="date" class="df-input" [(ngModel)]="newProjectData.startDate" name="pstart" />
          </div>
          <div class="form-group">
            <label class="df-label">Fecha Límite de Entrega</label>
            <input type="date" class="df-input" [(ngModel)]="newProjectData.targetDeliveryDate" name="pdelivery" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Descripción del Alcance</label>
          <textarea class="df-textarea" rows="3" [(ngModel)]="newProjectData.description" name="pdesc" placeholder="Detalles de la solución de arquitectura, frontend y backend..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openNewProjectModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Crear Proyecto</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .hero-banner {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 1.25rem;
      background: radial-gradient(circle at 80% 20%, rgba(174, 199, 247, 0.15) 0%, transparent 60%),
                  linear-gradient(135deg, var(--df-primary-container) 0%, var(--df-surface-container) 100%);
      border-radius: var(--df-radius-xl);
      border: 1px solid rgba(174, 199, 247, 0.2);
      gap: 1.25rem;
    }

    @media (min-width: 768px) {
      .hero-banner {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 2rem 2.5rem;
      }
    }

    .hero-tag {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.6rem;
      flex-wrap: wrap;
    }

    .date-chip {
      color: var(--df-on-primary-container);
      font-weight: 500;
    }

    .hero-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--df-text-primary);
      margin-bottom: 0.5rem;
    }

    @media (min-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }
    }

    .hero-subtitle {
      color: var(--df-on-surface-variant);
      max-width: 650px;
      font-size: 0.9rem;
    }

    .hero-actions {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    @media (min-width: 640px) {
      .hero-actions {
        flex-direction: row;
        width: auto;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1100px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .dashboard-two-col {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    @media (min-width: 1024px) {
      .dashboard-two-col {
        grid-template-columns: 1.4fr 1fr;
      }
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .card-desc {
      color: var(--df-text-muted);
      margin-top: 0.15rem;
    }

    .view-all-link {
      color: var(--df-primary);
      text-decoration: none;
      font-weight: 600;
      white-space: nowrap;
    }
    .view-all-link:hover {
      text-decoration: underline;
    }

    /* Pipeline stage boxes */
    .pipeline-stages-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 640px) {
      .pipeline-stages-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 900px) {
      .pipeline-stages-grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }

    .stage-box {
      background-color: var(--df-surface-container-low);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-lg);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: all var(--df-transition-fast);
    }

    .stage-box:hover {
      border-color: var(--df-primary);
      background-color: var(--df-surface-container-high);
      transform: translateY(-2px);
    }

    .stage-box.active-stage {
      border-color: rgba(174, 199, 247, 0.4);
      background-color: rgba(27, 54, 93, 0.3);
    }

    .stage-name {
      color: var(--df-text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .stage-count {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--df-text-primary);
      line-height: 1.2;
      margin: 0.25rem 0;
    }

    .stage-sub {
      font-size: 0.65rem;
      color: var(--df-on-surface-variant);
    }

    .pipeline-progress-section {
      padding-top: 0.75rem;
      border-top: 1px solid var(--df-border-subtle);
    }

    /* Deliveries List */
    .deliveries-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .milestone-item {
      background-color: var(--df-surface-container-low);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-lg);
      padding: 1rem;
      transition: all var(--df-transition-fast);
    }

    .milestone-item:hover {
      border-color: var(--df-border-medium);
      background-color: var(--df-surface-container-high);
    }

    .milestone-header-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .milestone-version {
      font-size: 0.75rem;
      color: var(--df-primary);
      font-weight: 600;
    }

    .milestone-title {
      font-size: 0.925rem;
      font-weight: 600;
      color: var(--df-text-primary);
      margin-bottom: 0.5rem;
    }

    .milestone-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--df-text-muted);
    }

    .date-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--df-tertiary);
    }

    /* Table specifics */
    .project-title-cell {
      display: flex;
      flex-direction: column;
    }

    .project-name {
      font-weight: 600;
      color: var(--df-text-primary);
    }

    .client-sub {
      color: var(--df-text-muted);
    }

    .category-tag {
      background-color: var(--df-surface-container-highest);
      padding: 0.2rem 0.5rem;
      border-radius: var(--df-radius-sm);
      font-size: 0.7rem;
      color: var(--df-on-surface-variant);
    }

    .budget-cell {
      font-weight: 600;
      color: var(--df-text-primary);
    }

    /* Leads List */
    .leads-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .lead-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.85rem;
      background-color: var(--df-surface-container-low);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-lg);
    }

    .lead-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--df-primary) 0%, var(--df-primary-container) 100%);
      color: var(--df-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .lead-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .lead-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .lead-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .lead-company {
      color: var(--df-text-muted);
    }

    .lead-msg {
      color: var(--df-on-surface-variant);
      font-style: italic;
      line-height: 1.3;
      margin: 0.25rem 0;
    }

    .lead-meta-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .budget-pill {
      color: var(--df-success);
      font-weight: 600;
    }

    .source-pill {
      color: var(--df-primary);
      background: rgba(174, 199, 247, 0.1);
      padding: 0.1rem 0.4rem;
      border-radius: var(--df-radius-sm);
    }

    /* Modal Form */
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
export class DashboardComponent {
  readonly projectService = inject(ProjectService);
  readonly clientService = inject(ClientService);
  readonly devService = inject(DevelopmentService);
  readonly qaService = inject(QaService);
  readonly deliveryService = inject(DeliveryService);
  readonly supabaseService = inject(SupabaseService);
  readonly notificationService = inject(NotificationService);

  readonly openNewClientModal = signal<boolean>(false);
  readonly openNewProjectModal = signal<boolean>(false);

  readonly todayDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  newClientData = {
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'lead' as any,
    totalBudget: 40000,
    source: 'DASFusion-hub' as any,
    country: 'México',
    tags: ['Nuevo Lead'],
    hubMessage: ''
  };

  newProjectData = {
    title: '',
    clientId: 'cli-01',
    clientName: 'Alejandro Morales',
    clientCompany: 'Nexus Logistics AI',
    description: '',
    category: 'AI & Machine Learning' as ProjectCategory,
    status: 'lead' as any,
    priority: 'high' as any,
    budget: 45000,
    currency: 'USD' as any,
    startDate: new Date().toISOString().substring(0, 10),
    targetDeliveryDate: '2026-11-30',
    techStack: ['Angular 21', 'Python FastApi', 'Supabase'],
    requirements: []
  };

  getCompletedChecklistCount(m: any): number {
    return m.checklist.filter((i: any) => i.isCompleted).length;
  }

  onProjectClientSelect(event: Event) {
    const clientId = (event.target as HTMLSelectElement).value;
    const client = this.clientService.getClientById(clientId);
    if (client) {
      this.newProjectData.clientName = client.name;
      this.newProjectData.clientCompany = client.company;
    }
  }

  saveClient() {
    if (!this.newClientData.name || !this.newClientData.company || !this.newClientData.email) {
      this.notificationService.error('Campos requeridos', 'Por favor completa nombre, empresa y email.');
      return;
    }

    this.clientService.createClient(this.newClientData);
    this.openNewClientModal.set(false);
    this.notificationService.success('Cliente Registrado', `Se ha agregado ${this.newClientData.name} con éxito.`);
    
    // Reset form
    this.newClientData = {
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'lead',
      totalBudget: 40000,
      source: 'DASFusion-hub',
      country: 'México',
      tags: ['Nuevo Lead'],
      hubMessage: ''
    };
  }

  saveProject() {
    if (!this.newProjectData.title) {
      this.notificationService.error('Título requerido', 'Por favor ingresa un título para el proyecto.');
      return;
    }

    this.projectService.createProject(this.newProjectData);
    this.openNewProjectModal.set(false);
    this.notificationService.success('Proyecto Creado', `Proyecto "${this.newProjectData.title}" inicializado.`);
    
    this.newProjectData.title = '';
    this.newProjectData.description = '';
  }
}
