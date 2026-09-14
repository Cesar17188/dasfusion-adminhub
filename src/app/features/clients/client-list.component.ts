import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ClientService } from '../../core/services/client.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { Client, ClientStatus } from '../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusBadgeComponent, 
    ModalComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="clients-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">CRM ADMINISTRADOR</span>
            <span class="caption">Relaciones & Negociaciones</span>
          </div>
          <h1 class="headline-md page-title">Directorio de Clientes & Leads</h1>
          <p class="body-md page-subtitle">
            Seguimiento de prospectos provenientes de DASFusion-hub, historial de notas, contratos y valor acumulado.
          </p>
        </div>

        <button type="button" class="df-btn df-btn-primary" (click)="openCreateModal.set(true)">
          + Nuevo Cliente / Lead
        </button>
      </div>

      <!-- Controls & Search Bar -->
      <div class="controls-bar df-card">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por nombre, empresa, email o tags..." 
            class="df-input search-input"
            [ngModel]="clientService.searchQuery()"
            (ngModelChange)="clientService.searchQuery.set($event)"
          />
        </div>

        <div class="filters-group">
          <select 
            class="df-select filter-select" 
            [ngModel]="clientService.statusFilter()" 
            (ngModelChange)="clientService.statusFilter.set($event)"
          >
            <option value="all">Todos los Estados</option>
            <option value="lead">Leads Hub</option>
            <option value="contacted">Contactados</option>
            <option value="negotiation">En Negociación</option>
            <option value="active">Clientes Activos</option>
            <option value="completed">Completados</option>
          </select>
        </div>
      </div>

      <!-- Clients Table -->
      <div class="df-table-container">
        <table class="df-table">
          <thead>
            <tr>
              <th>Cliente / Empresa</th>
              <th>Contacto</th>
              <th>Origen</th>
              <th>Estado CRM</th>
              <th>Presupuesto Total</th>
              <th>País</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (client of clientService.filteredClients(); track client.id) {
              <tr (click)="openClientDetail(client)" style="cursor: pointer;">
                <td>
                  <div class="client-cell">
                    <div class="client-avatar">{{ client.name.charAt(0) }}</div>
                    <div>
                      <strong class="client-name">{{ client.name }}</strong>
                      <span class="caption company-name">{{ client.company }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-cell">
                    <span class="email-text">{{ client.email }}</span>
                    <span class="caption phone-text">{{ client.phone || 'Sin teléfono' }}</span>
                  </div>
                </td>
                <td>
                  <span class="caption source-pill">{{ client.source }}</span>
                </td>
                <td>
                  <app-status-badge [status]="client.status"></app-status-badge>
                </td>
                <td>
                  <strong class="mono budget-text">{{ client.totalBudget | currency:'USD':'symbol':'1.0-0' }}</strong>
                </td>
                <td>
                  <span class="caption country-text">{{ client.country || 'N/A' }}</span>
                </td>
                <td>
                  <button type="button" class="df-btn df-btn-sm df-btn-secondary" (click)="$event.stopPropagation(); openClientDetail(client)">
                    Ficha CRM
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  <app-empty-state
                    title="No se encontraron clientes"
                    description="No hay clientes o leads que coincidan con la búsqueda."
                    actionLabel="Ver Todos"
                    (action)="clientService.searchQuery.set(''); clientService.statusFilter.set('all')"
                  ></app-empty-state>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Detalle / Ficha de Cliente CRM -->
    @if (selectedClient()) {
      <app-modal
        [isOpen]="isDetailOpen()"
        [title]="selectedClient()!.name"
        [subtitle]="selectedClient()!.company + ' • ' + selectedClient()!.country"
        maxWidth="820px"
        (close)="isDetailOpen.set(false)"
      >
        <div class="crm-modal-content">
          <!-- Overview Cards -->
          <div class="overview-grid">
            <div class="overview-cell">
              <span class="caption">Email Corporativo:</span>
              <strong>{{ selectedClient()!.email }}</strong>
            </div>
            <div class="overview-cell">
              <span class="caption">Teléfono:</span>
              <strong>{{ selectedClient()!.phone || 'No especificado' }}</strong>
            </div>
            <div class="overview-cell">
              <span class="caption">Presupuesto Acumulado:</span>
              <strong class="mono">{{ selectedClient()!.totalBudget | currency:'USD':'symbol':'1.0-0' }}</strong>
            </div>
            <div class="overview-cell">
              <span class="caption">Origen Lead:</span>
              <strong class="text-primary">{{ selectedClient()!.source }}</strong>
            </div>
          </div>

          @if (selectedClient()!.hubMessage) {
            <div class="hub-message-box">
              <span class="caption msg-label">Mensaje Original enviado en DASFusion-hub:</span>
              <p class="body-sm">"{{ selectedClient()!.hubMessage }}"</p>
            </div>
          }

          <!-- Associated Projects -->
          <div class="crm-section">
            <h4 class="section-title">Proyectos Vinculados ({{ getClientProjects(selectedClient()!.id).length }})</h4>
            <div class="projects-linked-list">
              @for (proj of getClientProjects(selectedClient()!.id); track proj.id) {
                <div class="linked-proj-card">
                  <div class="linked-proj-header">
                    <strong>{{ proj.title }}</strong>
                    <app-status-badge [status]="proj.status"></app-status-badge>
                  </div>
                  <div class="linked-proj-meta">
                    <span class="caption">Presupuesto: {{ proj.budget | currency:proj.currency:'symbol':'1.0-0' }}</span>
                    <span class="caption">Progreso: {{ proj.progressPercentage }}%</span>
                  </div>
                </div>
              } @empty {
                <span class="caption empty-text">Este cliente aún no tiene proyectos formales asociados.</span>
              }
            </div>
          </div>

          <!-- Notes & Interaction Timeline -->
          <div class="crm-section">
            <div class="section-header-row">
              <h4 class="section-title">Bitácora de Notas & Interacciones</h4>
            </div>

            <!-- Add Note Form -->
            <div class="add-note-box">
              <textarea 
                class="df-textarea" 
                rows="2" 
                placeholder="Registrar nueva nota de reunión, acuerdo comercial o seguimiento..." 
                [(ngModel)]="newNoteContent"
              ></textarea>
              <button type="button" class="df-btn df-btn-primary add-note-btn" (click)="saveNote()">
                + Agregar Nota
              </button>
            </div>

            <!-- Timeline list -->
            <div class="timeline-list">
              @for (note of selectedClient()!.notes; track note.id) {
                <div class="timeline-note-item">
                  <div class="note-meta-line">
                    <span class="note-author">{{ note.author }}</span>
                    <span class="caption note-date">{{ note.date }}</span>
                  </div>
                  <p class="body-sm note-text">{{ note.content }}</p>
                </div>
              } @empty {
                <span class="caption empty-text">No hay notas registradas para este cliente.</span>
              }
            </div>
          </div>

          <!-- Change Status -->
          <div class="crm-section">
            <h4 class="section-title">Cambiar Estado de Negociación</h4>
            <div class="status-options">
              @for (st of ['lead', 'contacted', 'negotiation', 'active', 'completed', 'on_hold']; track st) {
                <button 
                  type="button" 
                  class="df-btn df-btn-sm" 
                  [class.df-btn-primary]="selectedClient()!.status === st"
                  [class.df-btn-ghost]="selectedClient()!.status !== st"
                  (click)="changeClientStatus(selectedClient()!.id, st)"
                >
                  {{ st }}
                </button>
              }
            </div>
          </div>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-danger" (click)="deleteClient(selectedClient()!.id)">
            Eliminar Cliente
          </button>
          <button type="button" class="df-btn df-btn-primary" (click)="isDetailOpen.set(false)">
            Cerrar Ficha
          </button>
        </div>
      </app-modal>
    }

    <!-- Modal Crear Cliente -->
    <app-modal
      [isOpen]="openCreateModal()"
      title="Registrar Nuevo Cliente / Lead"
      subtitle="Ingresa los datos para seguimiento comercial"
      (close)="openCreateModal.set(false)"
    >
      <form (ngSubmit)="submitNewClient()" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Nombre del Contacto *</label>
            <input type="text" class="df-input" [(ngModel)]="newClient.name" name="n" required placeholder="Ej: Patricia Reyes" />
          </div>
          <div class="form-group">
            <label class="df-label">Empresa *</label>
            <input type="text" class="df-input" [(ngModel)]="newClient.company" name="c" required placeholder="Ej: DataCorp Global" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Email Corporativo *</label>
            <input type="email" class="df-input" [(ngModel)]="newClient.email" name="e" required placeholder="preyes@datacorp.com" />
          </div>
          <div class="form-group">
            <label class="df-label">Teléfono</label>
            <input type="text" class="df-input" [(ngModel)]="newClient.phone" name="p" placeholder="+1 (555) 987-6543" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Estado CRM</label>
            <select class="df-select" [(ngModel)]="newClient.status" name="s">
              <option value="lead">Lead Hub</option>
              <option value="contacted">Contactado</option>
              <option value="negotiation">En Negociación</option>
              <option value="active">Activo</option>
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Presupuesto Estimado (USD)</label>
            <input type="number" class="df-input" [(ngModel)]="newClient.totalBudget" name="tb" placeholder="35000" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Mensaje / Resumen de Requerimientos</label>
          <textarea class="df-textarea" rows="3" [(ngModel)]="newClient.hubMessage" name="hm" placeholder="Necesidades de IA, automatización o software web..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openCreateModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Guardar Cliente</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .clients-page {
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

    .controls-bar {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 1rem;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
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
      width: 100%;
    }

    @media (min-width: 640px) {
      .filters-group {
        width: auto;
      }
    }

    .filter-select {
      width: 100%;
      min-width: 180px;
    }

    .client-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .client-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--df-primary) 0%, var(--df-primary-container) 100%);
      color: var(--df-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .client-name {
      display: block;
      color: var(--df-text-primary);
    }

    .company-name {
      color: var(--df-text-muted);
    }

    .contact-cell {
      display: flex;
      flex-direction: column;
    }

    .email-text {
      color: var(--df-on-surface);
      font-size: 0.85rem;
    }

    .phone-text {
      color: var(--df-text-muted);
    }

    .source-pill {
      background-color: var(--df-surface-container-high);
      color: var(--df-primary);
      padding: 0.2rem 0.5rem;
      border-radius: var(--df-radius-sm);
    }

    .budget-text {
      color: var(--df-text-primary);
    }

    /* Modal Details */
    .crm-modal-content {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
      background-color: var(--df-surface-container-low);
      padding: 1rem;
      border-radius: var(--df-radius-lg);
    }

    @media (min-width: 600px) {
      .overview-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .overview-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .hub-message-box {
      background: rgba(27, 54, 93, 0.25);
      border: 1px solid rgba(174, 199, 247, 0.2);
      border-radius: var(--df-radius-default);
      padding: 0.85rem 1rem;
    }

    .msg-label {
      color: var(--df-primary);
      font-weight: 600;
      display: block;
      margin-bottom: 0.25rem;
    }

    .crm-section {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--df-on-surface-variant);
    }

    .projects-linked-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .linked-proj-card {
      background-color: var(--df-surface-container-low);
      padding: 0.75rem 1rem;
      border-radius: var(--df-radius-default);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .linked-proj-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .linked-proj-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      color: var(--df-text-muted);
    }

    .add-note-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .add-note-btn {
      align-self: flex-end;
    }

    .timeline-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .timeline-note-item {
      background-color: var(--df-surface-container-low);
      padding: 0.75rem 1rem;
      border-radius: var(--df-radius-default);
      border-left: 3px solid var(--df-primary);
    }

    .note-meta-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }

    .note-author {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .note-date {
      color: var(--df-text-muted);
    }

    .status-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
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
export class ClientListComponent {
  readonly clientService = inject(ClientService);
  readonly projectService = inject(ProjectService);
  readonly notificationService = inject(NotificationService);

  readonly selectedClient = signal<Client | null>(null);
  readonly isDetailOpen = signal<boolean>(false);
  readonly openCreateModal = signal<boolean>(false);
  newNoteContent = '';

  newClient = {
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'lead' as ClientStatus,
    totalBudget: 35000,
    source: 'DASFusion-hub' as any,
    country: 'México',
    tags: ['Lead Hub'],
    hubMessage: ''
  };

  openClientDetail(client: Client) {
    this.selectedClient.set(client);
    this.isDetailOpen.set(true);
  }

  getClientProjects(clientId: string) {
    return this.projectService.getProjectsByClientId(clientId);
  }

  saveNote() {
    if (!this.newNoteContent.trim() || !this.selectedClient()) return;
    this.clientService.addNote(this.selectedClient()!.id, this.newNoteContent.trim());
    this.selectedClient.set(this.clientService.getClientById(this.selectedClient()!.id) || null);
    this.newNoteContent = '';
    this.notificationService.success('Nota Guardada', 'Se ha añadido la nota a la bitácora del cliente.');
  }

  changeClientStatus(clientId: string, status: any) {
    this.clientService.updateClient(clientId, { status });
    this.selectedClient.set(this.clientService.getClientById(clientId) || null);
    this.notificationService.info('Estado Actualizado', `Cliente actualizado a ${status.toUpperCase()}`);
  }

  deleteClient(id: string) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clientService.deleteClient(id);
      this.isDetailOpen.set(false);
      this.notificationService.warning('Cliente Eliminado', 'El registro fue retirado del CRM.');
    }
  }

  submitNewClient() {
    if (!this.newClient.name || !this.newClient.company || !this.newClient.email) {
      this.notificationService.error('Campos Faltantes', 'Por favor llena nombre, empresa y correo electrónico.');
      return;
    }
    this.clientService.createClient(this.newClient);
    this.openCreateModal.set(false);
    this.notificationService.success('Cliente Registrado', `Cliente ${this.newClient.name} creado.`);
    this.newClient.name = '';
    this.newClient.company = '';
    this.newClient.email = '';
    this.newClient.phone = '';
  }
}
