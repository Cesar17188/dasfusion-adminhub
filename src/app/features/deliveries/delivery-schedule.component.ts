import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { DeliveryService } from '../../core/services/delivery.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { DeliveryMilestone, DeliveryStatus } from '../../core/models/delivery.model';

@Component({
  selector: 'app-delivery-schedule',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div class="deliveries-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">ENTREGAS & RELEASES</span>
            <span class="caption">Hitos & Aceptación del Cliente</span>
          </div>
          <h1 class="headline-md page-title">Tiempos de Entrega & Despliegues</h1>
          <p class="body-md page-subtitle">
            Cronograma de lanzamientos a producción, checklists de validación pre-entrega y actas de conformidad.
          </p>
        </div>

        <button type="button" class="df-btn df-btn-primary" (click)="openNewMilestoneModal.set(true)">
          + Nuevo Hito de Entrega
        </button>
      </div>

      <!-- Deliveries Status Overview -->
      <div class="delivery-metrics-grid">
        <div class="df-card metric-box">
          <span class="caption">Hitos en Tiempo</span>
          <div class="stat-num text-success">{{ deliveryService.onTrackCount() }}</div>
          <span class="caption">Compromisos con ritmo óptimo</span>
        </div>

        <div class="df-card metric-box">
          <span class="caption">Hitos en Riesgo</span>
          <div class="stat-num text-warning">{{ deliveryService.atRiskCount() }}</div>
          <span class="caption">Posible ajuste de alcance necesario</span>
        </div>

        <div class="df-card metric-box">
          <span class="caption">Entregas Finalizadas</span>
          <div class="stat-num text-primary">{{ deliveryService.deliveredCount() }}</div>
          <span class="caption">Conformidad de cliente firmada</span>
        </div>
      </div>

      <!-- Milestones List -->
      <div class="milestones-container">
        @for (milestone of deliveryService.milestones(); track milestone.id) {
          <div class="df-card milestone-card" [class.milestone-accepted]="milestone.status === 'accepted'">
            <!-- Milestone Header -->
            <div class="m-header">
              <div class="m-title-block">
                <div class="m-version-row">
                  <span class="mono version-chip">{{ milestone.releaseVersion }}</span>
                  <span class="caption proj-tag">{{ getProjectTitle(milestone.projectId) }}</span>
                </div>
                <h3 class="headline-sm m-title">{{ milestone.milestoneTitle }}</h3>
              </div>

              <div class="m-status-block">
                <div class="due-box">
                  <span class="caption">Fecha de Entrega:</span>
                  <strong class="due-date">{{ milestone.dueDate }}</strong>
                </div>
                <app-status-badge [status]="milestone.status"></app-status-badge>
              </div>
            </div>

            @if (milestone.notes) {
              <p class="body-sm m-notes">{{ milestone.notes }}</p>
            }

            @if (milestone.deploymentUrl) {
              <div class="deploy-url-box">
                <span class="caption">URL de Despliegue:</span>
                <a [href]="milestone.deploymentUrl" target="_blank" rel="noopener" class="deploy-link mono">
                  {{ milestone.deploymentUrl }} ↗
                </a>
              </div>
            }

            <!-- Pre-Release Deployment Checklist -->
            <div class="checklist-box">
              <div class="checklist-header">
                <span class="label-md">Checklist de Calidad & Despliegue ({{ getCompletedCount(milestone) }}/{{ milestone.checklist.length }})</span>
                <span class="caption">{{ getChecklistPercentage(milestone) }}% completado</span>
              </div>

              <div class="checklist-items-grid">
                @for (item of milestone.checklist; track item.id) {
                  <label class="check-item" [class.check-done]="item.isCompleted">
                    <input 
                      type="checkbox" 
                      [checked]="item.isCompleted" 
                      (change)="deliveryService.toggleChecklistItem(milestone.id, item.id)"
                    />
                    <span class="check-label">{{ item.label }}</span>
                    @if (item.isRequired) {
                      <span class="req-star" title="Obligatorio para release">*</span>
                    }
                  </label>
                }
              </div>
            </div>

            <!-- Client Sign-Off Acceptance Section -->
            <div class="signoff-section">
              <div class="signoff-header">
                <span class="label-md">Aceptación y Feedback del Cliente</span>
                @if (milestone.clientSignOff.isSigned) {
                  <span class="df-pill df-pill-success">✓ Aceptado Formalmente</span>
                } @else {
                  <button type="button" class="df-btn df-btn-sm df-btn-secondary" (click)="openSignOffModal(milestone)">
                    Firmar Entrega
                  </button>
                }
              </div>

              @if (milestone.clientSignOff.isSigned) {
                <div class="signoff-details">
                  <div class="signoff-meta">
                    <span>Firmado por: <strong>{{ milestone.clientSignOff.signedBy }}</strong></span>
                    <span class="caption">Fecha: {{ milestone.clientSignOff.signedAt | date:'medium' }}</span>
                    @if (milestone.clientSignOff.rating) {
                      <span class="rating-stars">
                        @for (star of [1,2,3,4,5]; track star) {
                          <span [style.color]="star <= milestone.clientSignOff.rating! ? '#f1bd81' : '#44474e'">★</span>
                        }
                      </span>
                    }
                  </div>
                  @if (milestone.clientSignOff.feedback) {
                    <p class="caption client-feedback">"{{ milestone.clientSignOff.feedback }}"</p>
                  }
                </div>
              } @else {
                <p class="caption pending-signoff">Pendiente de validación y firma por los directivos del cliente.</p>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal: Nuevo Hito de Entrega -->
    <app-modal
      [isOpen]="openNewMilestoneModal()"
      title="Crear Hito de Entrega"
      subtitle="Define la versión de release, fecha límite y criterios de aceptación"
      (close)="openNewMilestoneModal.set(false)"
    >
      <form (ngSubmit)="submitMilestone()" class="modal-form">
        <div class="form-group">
          <label class="df-label">Título del Hito *</label>
          <input type="text" class="df-input" [(ngModel)]="newM.milestoneTitle" name="mtitle" required placeholder="Ej: Release v1.0.0 Go-Live en Producción" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Proyecto *</label>
            <select class="df-select" [(ngModel)]="newM.projectId" name="mproj">
              @for (proj of projectService.projects(); track proj.id) {
                <option [value]="proj.id">{{ proj.title }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Versión de Release *</label>
            <input type="text" class="df-input" [(ngModel)]="newM.releaseVersion" name="mver" required placeholder="v1.0.0-rc1" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Fecha Límite de Entrega *</label>
            <input type="date" class="df-input" [(ngModel)]="newM.dueDate" name="mdue" required />
          </div>
          <div class="form-group">
            <label class="df-label">Estado Inicial</label>
            <select class="df-select" [(ngModel)]="newM.status" name="mst">
              <option value="upcoming">Próximo</option>
              <option value="on_track">En Tiempo</option>
              <option value="at_risk">En Riesgo</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">URL de Despliegue / Staging (Opcional)</label>
          <input type="url" class="df-input" [(ngModel)]="newM.deploymentUrl" name="murl" placeholder="https://app.staging.dasfusion.cloud" />
        </div>

        <div class="form-group">
          <label class="df-label">Notas Adicionales</label>
          <textarea class="df-textarea" rows="2" [(ngModel)]="newM.notes" name="mnotes" placeholder="Condiciones de entrega o requerimientos de infraestructura..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openNewMilestoneModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Guardar Hito</button>
        </div>
      </form>
    </app-modal>

    <!-- Modal: Firma de Aceptación -->
    @if (selectedMilestoneForSignOff()) {
      <app-modal
        [isOpen]="isSignOffOpen()"
        title="Registrar Firma de Aceptación del Cliente"
        [subtitle]="selectedMilestoneForSignOff()!.milestoneTitle"
        (close)="isSignOffOpen.set(false)"
      >
        <div class="modal-form">
          <div class="form-group">
            <label class="df-label">Nombre del Firmante / Representante *</label>
            <input type="text" class="df-input" [(ngModel)]="signOffData.signedBy" placeholder="Ej: Elena Rostova (VP Technology)" />
          </div>

          <div class="form-group">
            <label class="df-label">Calificación de Satisfacción (1 a 5 estrellas)</label>
            <select class="df-select" [(ngModel)]="signOffData.rating">
              <option [ngValue]="5">⭐⭐⭐⭐⭐ 5 Estrellas (Excelente)</option>
              <option [ngValue]="4">⭐⭐⭐⭐ 4 Estrellas (Muy Bueno)</option>
              <option [ngValue]="3">⭐⭐⭐ 3 Estrellas (Aceptable)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="df-label">Comentarios o Feedback del Cliente</label>
            <textarea class="df-textarea" rows="3" [(ngModel)]="signOffData.feedback" placeholder="Comentarios sobre el rendimiento, tiempos de entrega y calidad del software..."></textarea>
          </div>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="isSignOffOpen.set(false)">Cancelar</button>
          <button type="button" class="df-btn df-btn-primary" (click)="confirmSignOff()">Firmar y Aprobar</button>
        </div>
      </app-modal>
    }
  `,
  styles: [`
    .deliveries-page {
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

    .deliveries-page {
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

    .delivery-metrics-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .delivery-metrics-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }
    }

    .metric-box {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .stat-num {
      font-size: 1.75rem;
      font-weight: 700;
    }

    .text-success { color: var(--df-success); }
    .text-warning { color: var(--df-tertiary); }
    .text-primary { color: var(--df-primary); }

    .milestones-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .milestone-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background-color: var(--df-surface-container);
    }

    .milestone-accepted {
      border-color: rgba(107, 227, 161, 0.3);
    }

    .m-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .m-header {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }
    }

    .m-version-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      flex-wrap: wrap;
    }

    .version-chip {
      background-color: var(--df-surface-container-high);
      color: var(--df-primary);
      padding: 0.15rem 0.5rem;
      border-radius: var(--df-radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .proj-tag {
      color: var(--df-text-muted);
    }

    .m-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .m-status-block {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .m-status-block {
        width: auto;
        justify-content: flex-end;
        gap: 1.25rem;
      }
    }

    .due-box {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    @media (min-width: 640px) {
      .due-box {
        text-align: right;
      }
    }

    .due-date {
      color: var(--df-tertiary);
      font-size: 0.95rem;
    }

    .m-notes {
      color: var(--df-on-surface-variant);
    }

    .deploy-url-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--df-surface-container-low);
      padding: 0.5rem 0.85rem;
      border-radius: var(--df-radius-default);
    }

    .deploy-link {
      color: var(--df-primary);
      text-decoration: none;
      font-size: 0.85rem;
    }
    .deploy-link:hover {
      text-decoration: underline;
    }

    /* Checklist */
    .checklist-box {
      background-color: var(--df-surface-container-low);
      border-radius: var(--df-radius-lg);
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .checklist-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .checklist-items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 0.65rem;
    }

    .check-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background-color: var(--df-surface-container);
      padding: 0.65rem 0.85rem;
      border-radius: var(--df-radius-default);
      cursor: pointer;
    }

    .check-item.check-done .check-label {
      text-decoration: line-through;
      color: var(--df-text-muted);
    }

    .check-label {
      font-size: 0.85rem;
      flex: 1;
    }

    .req-star {
      color: var(--df-error);
      font-weight: 700;
    }

    /* Sign-off */
    .signoff-section {
      border-top: 1px solid var(--df-border-subtle);
      padding-top: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .signoff-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .signoff-details {
      background-color: var(--df-surface-container-low);
      padding: 0.85rem 1rem;
      border-radius: var(--df-radius-default);
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .signoff-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.85rem;
    }

    .rating-stars {
      font-size: 1rem;
      letter-spacing: 0.1em;
    }

    .client-feedback {
      color: var(--df-primary);
      font-style: italic;
    }

    .pending-signoff {
      color: var(--df-text-muted);
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
export class DeliveryScheduleComponent {
  readonly deliveryService = inject(DeliveryService);
  readonly projectService = inject(ProjectService);
  readonly notificationService = inject(NotificationService);

  readonly openNewMilestoneModal = signal<boolean>(false);
  readonly isSignOffOpen = signal<boolean>(false);
  readonly selectedMilestoneForSignOff = signal<DeliveryMilestone | null>(null);

  signOffData = {
    signedBy: '',
    rating: 5,
    feedback: ''
  };

  newM = {
    milestoneTitle: '',
    projectId: 'prj-01',
    releaseVersion: 'v1.0.0',
    dueDate: new Date().toISOString().substring(0, 10),
    status: 'on_track' as DeliveryStatus,
    deploymentUrl: '',
    notes: '',
    checklist: [
      { id: 'c1', label: '100% de Pruebas Unitarias aprobadas', isCompleted: false, isRequired: true, category: 'code_quality' as const },
      { id: 'c2', label: 'Auditoría de seguridad y escaneo de vulnerabilidades', isCompleted: false, isRequired: true, category: 'security' as const },
      { id: 'c3', label: 'Pipeline de despliegue automatizado configurado', isCompleted: false, isRequired: true, category: 'infrastructure' as const },
      { id: 'c4', label: 'Documentación técnica de usuario entregada', isCompleted: false, isRequired: false, category: 'documentation' as const },
      { id: 'c5', label: 'Aprobación formal del cliente (UAT Sign-off)', isCompleted: false, isRequired: true, category: 'client_approval' as const }
    ],
    clientSignOff: {
      isSigned: false
    }
  };

  getProjectTitle(projectId: string): string {
    const p = this.projectService.getProjectById(projectId);
    return p ? p.title : 'Proyecto General';
  }

  getCompletedCount(m: DeliveryMilestone): number {
    return m.checklist.filter(i => i.isCompleted).length;
  }

  getChecklistPercentage(m: DeliveryMilestone): number {
    if (!m.checklist.length) return 0;
    return Math.round((this.getCompletedCount(m) / m.checklist.length) * 100);
  }

  openSignOffModal(milestone: DeliveryMilestone) {
    this.selectedMilestoneForSignOff.set(milestone);
    this.signOffData = {
      signedBy: '',
      rating: 5,
      feedback: ''
    };
    this.isSignOffOpen.set(true);
  }

  confirmSignOff() {
    if (!this.signOffData.signedBy.trim() || !this.selectedMilestoneForSignOff()) {
      this.notificationService.error('Nombre Obligatorio', 'Ingresa el nombre del representante que firma.');
      return;
    }

    this.deliveryService.signOffMilestone(
      this.selectedMilestoneForSignOff()!.id,
      this.signOffData.signedBy,
      this.signOffData.rating,
      this.signOffData.feedback
    );

    this.isSignOffOpen.set(false);
    this.notificationService.success('Entrega Aceptada', 'El acta de conformidad fue firmada exitosamente.');
  }

  submitMilestone() {
    if (!this.newM.milestoneTitle || !this.newM.dueDate) {
      this.notificationService.error('Campos Faltantes', 'Por favor llena título y fecha de entrega.');
      return;
    }

    this.deliveryService.createMilestone(this.newM);
    this.openNewMilestoneModal.set(false);
    this.notificationService.success('Hito de Entrega Creado', `Release "${this.newM.releaseVersion}" programado.`);
  }
}
