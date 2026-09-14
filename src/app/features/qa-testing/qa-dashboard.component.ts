import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal.component';
import { QaService } from '../../core/services/qa.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { BugSeverity, BugStatus, TestCase, TestType } from '../../core/models/qa-testing.model';

@Component({
  selector: 'app-qa-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div class="qa-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">CONTROL DE CALIDAD & QA</span>
            <span class="caption">Validación & Resiliencia</span>
          </div>
          <h1 class="headline-md page-title">Tiempos de Prueba & Gestión de Bugs</h1>
          <p class="body-md page-subtitle">
            Validación de suites de prueba (Unitarias, Integración, UAT, Seguridad y Cargas) y resolución de incidencias.
          </p>
        </div>

        <div class="header-actions">
          <button type="button" class="df-btn df-btn-secondary" (click)="openNewTestModal.set(true)">
            + Caso de Prueba
          </button>
          <button type="button" class="df-btn df-btn-danger" (click)="openNewBugModal.set(true)">
            ⚠️ Reportar Bug
          </button>
        </div>
      </div>

      <!-- QA Stats Grid -->
      <div class="qa-stats-grid">
        <div class="df-card qa-stat-card">
          <span class="caption">Tasa de Aprobación</span>
          <div class="stat-big-val text-success">{{ qaService.passRate() }}%</div>
          <span class="caption">{{ qaService.passedTestsCount() }} de {{ qaService.totalTestsCount() }} pruebas pasadas</span>
        </div>

        <div class="df-card qa-stat-card">
          <span class="caption">Pruebas Fallidas / Bloqueadas</span>
          <div class="stat-big-val text-danger">{{ qaService.failedTestsCount() }}</div>
          <span class="caption">Requieren atención de ingeniería</span>
        </div>

        <div class="df-card qa-stat-card">
          <span class="caption">Bugs Abiertos</span>
          <div class="stat-big-val text-warning">{{ qaService.openBugsCount() }}</div>
          <span class="caption">{{ qaService.criticalBugsCount() }} con severidad crítica</span>
        </div>
      </div>

      <!-- Main QA Content Tabs -->
      <div class="qa-tabs-header">
        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'tests'"
          (click)="activeTab.set('tests')"
        >
          🧪 Casos de Prueba ({{ qaService.testCases().length }})
        </button>
        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'bugs'"
          (click)="activeTab.set('bugs')"
        >
          🐛 Reporte de Bugs ({{ qaService.bugReports().length }})
        </button>
      </div>

      @if (activeTab() === 'tests') {
        <!-- Test Cases View -->
        <div class="df-card table-card">
          <!-- Filters bar -->
          <div class="table-filters-row">
            <select class="df-select filter-select" [ngModel]="qaService.selectedProjectId()" (ngModelChange)="qaService.selectedProjectId.set($event)">
              <option value="all">Todos los Proyectos</option>
              @for (proj of projectService.projects(); track proj.id) {
                <option [value]="proj.id">{{ proj.title }}</option>
              }
            </select>

            <select class="df-select filter-select" [ngModel]="qaService.typeFilter()" (ngModelChange)="qaService.typeFilter.set($event)">
              <option value="all">Todos los Tipos de Prueba</option>
              <option value="unit">Unitarias</option>
              <option value="integration">Integración</option>
              <option value="e2e">End-to-End (E2E)</option>
              <option value="uat">UAT (Aceptación Cliente)</option>
              <option value="security">Seguridad & PenTest</option>
              <option value="performance">Carga & Rendimiento</option>
            </select>
          </div>

          <div class="df-table-container">
            <table class="df-table">
              <thead>
                <tr>
                  <th>Caso de Prueba / Suite</th>
                  <th>Tipo</th>
                  <th>Resultado Esperado</th>
                  <th>Tester</th>
                  <th>Última Ejecución</th>
                  <th>Estado</th>
                  <th>Acción Rápida</th>
                </tr>
              </thead>
              <tbody>
                @for (tc of qaService.filteredTestCases(); track tc.id) {
                  <tr>
                    <td>
                      <div class="tc-title-cell">
                        <strong>{{ tc.title }}</strong>
                        <span class="caption suite-name">Suite: {{ tc.suite }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="df-pill df-pill-primary tc-type-badge">{{ tc.type }}</span>
                    </td>
                    <td>
                      <span class="caption result-text">{{ tc.expectedResult }}</span>
                    </td>
                    <td><span class="caption">{{ tc.tester }}</span></td>
                    <td><span class="caption mono">{{ tc.lastRun || 'Sin ejecutar' }}</span></td>
                    <td><app-status-badge [status]="tc.status"></app-status-badge></td>
                    <td>
                      <div class="tc-action-btns">
                        <button 
                          type="button" 
                          class="df-btn df-btn-sm pass-btn" 
                          (click)="qaService.updateTestCaseStatus(tc.id, 'passed')"
                          title="Marcar Aprobado"
                        >
                          ✓
                        </button>
                        <button 
                          type="button" 
                          class="df-btn df-btn-sm fail-btn" 
                          (click)="qaService.updateTestCaseStatus(tc.id, 'failed')"
                          title="Marcar Fallido"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <!-- Bugs Tracker View -->
        <div class="df-card bugs-card">
          <div class="bugs-grid">
            @for (bug of qaService.filteredBugs(); track bug.id) {
              <div class="bug-item df-card" [class.bug-critical]="bug.severity === 'critical'">
                <div class="bug-header-line">
                  <app-status-badge [status]="bug.severity"></app-status-badge>
                  <app-status-badge [status]="bug.status"></app-status-badge>
                </div>

                <h4 class="bug-title">{{ bug.title }}</h4>
                <p class="body-sm bug-desc">{{ bug.description }}</p>

                <div class="steps-box">
                  <span class="caption steps-label">Pasos para reproducir:</span>
                  <pre class="steps-pre caption">{{ bug.stepsToReproduce }}</pre>
                </div>

                <div class="bug-footer-line">
                  <span class="caption">Asignado: <strong>{{ bug.assignedDev }}</strong></span>
                  
                  <!-- Status Changer -->
                  <select 
                    class="df-select bug-status-select" 
                    [ngModel]="bug.status"
                    (ngModelChange)="qaService.updateBugStatus(bug.id, $event)"
                  >
                    <option value="open">Abierto</option>
                    <option value="investigating">Investigando</option>
                    <option value="fixing">En Corrección</option>
                    <option value="in_retest">En Re-test</option>
                    <option value="resolved">Resuelto</option>
                  </select>
                </div>
              </div>
            } @empty {
              <p class="caption empty-msg">No hay bugs reportados en este filtro.</p>
            }
          </div>
        </div>
      }
    </div>

    <!-- Modal: Nuevo Caso de Prueba -->
    <app-modal
      [isOpen]="openNewTestModal()"
      title="Crear Caso de Prueba"
      subtitle="Define las condiciones esperadas y la suite técnica"
      (close)="openNewTestModal.set(false)"
    >
      <form (ngSubmit)="submitNewTest()" class="modal-form">
        <div class="form-group">
          <label class="df-label">Título del Caso de Prueba *</label>
          <input type="text" class="df-input" [(ngModel)]="newTest.title" name="tctitle" required placeholder="Ej: Verificación de tiempo de respuesta de inferencia LLM" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Proyecto *</label>
            <select class="df-select" [(ngModel)]="newTest.projectId" name="tcproj">
              @for (proj of projectService.projects(); track proj.id) {
                <option [value]="proj.id">{{ proj.title }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Tipo de Prueba *</label>
            <select class="df-select" [(ngModel)]="newTest.type" name="tctype">
              <option value="unit">Unitaria</option>
              <option value="integration">Integración</option>
              <option value="e2e">End-to-End</option>
              <option value="uat">UAT (Aceptación)</option>
              <option value="security">Seguridad</option>
              <option value="performance">Rendimiento</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Nombre de Suite *</label>
            <input type="text" class="df-input" [(ngModel)]="newTest.suite" name="tcsuite" required placeholder="Ej: AI Inference Core" />
          </div>
          <div class="form-group">
            <label class="df-label">Tester Asignado *</label>
            <input type="text" class="df-input" [(ngModel)]="newTest.tester" name="tctester" required placeholder="Lic. Mariana Ruiz" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Resultado Esperado *</label>
          <textarea class="df-textarea" rows="2" [(ngModel)]="newTest.expectedResult" name="tcexp" required placeholder="El endpoint debe retornar código 200 con latencia < 300ms..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openNewTestModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-primary">Guardar Caso de Prueba</button>
        </div>
      </form>
    </app-modal>

    <!-- Modal: Reportar Bug -->
    <app-modal
      [isOpen]="openNewBugModal()"
      title="Reportar Incidencia / Bug"
      subtitle="Registra un defecto técnico con severidad y pasos para reproducir"
      (close)="openNewBugModal.set(false)"
    >
      <form (ngSubmit)="submitNewBug()" class="modal-form">
        <div class="form-group">
          <label class="df-label">Título del Bug *</label>
          <input type="text" class="df-input" [(ngModel)]="newBug.title" name="btitle" required placeholder="Ej: Error 500 al procesar archivos DICOM de más de 50MB" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Proyecto *</label>
            <select class="df-select" [(ngModel)]="newBug.projectId" name="bproj">
              @for (proj of projectService.projects(); track proj.id) {
                <option [value]="proj.id">{{ proj.title }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="df-label">Severidad *</label>
            <select class="df-select" [(ngModel)]="newBug.severity" name="bsev">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica (Bloqueante)</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="df-label">Reportado Por</label>
            <input type="text" class="df-input" [(ngModel)]="newBug.reportedBy" name="brep" placeholder="Mariana Ruiz" />
          </div>
          <div class="form-group">
            <label class="df-label">Asignar a Desarrollador</label>
            <input type="text" class="df-input" [(ngModel)]="newBug.assignedDev" name="bdev" placeholder="Carlos Vega" />
          </div>
        </div>

        <div class="form-group">
          <label class="df-label">Descripción</label>
          <textarea class="df-textarea" rows="2" [(ngModel)]="newBug.description" name="bdesc" placeholder="Comportamiento observado..."></textarea>
        </div>

        <div class="form-group">
          <label class="df-label">Pasos para Reproducir</label>
          <textarea class="df-textarea" rows="3" [(ngModel)]="newBug.stepsToReproduce" name="bsteps" placeholder="1. Abrir vista X&#10;2. Enviar payload Y..."></textarea>
        </div>

        <div footer>
          <button type="button" class="df-btn df-btn-ghost" (click)="openNewBugModal.set(false)">Cancelar</button>
          <button type="submit" class="df-btn df-btn-danger">Reportar Defecto</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .qa-page {
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

    .page-title {
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .page-subtitle {
      color: var(--df-text-secondary);
      font-size: 0.9rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .qa-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .qa-stat-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .stat-big-val {
      font-size: 2rem;
      font-weight: 700;
    }

    .text-success { color: var(--df-success); }
    .text-danger { color: var(--df-error); }
    .text-warning { color: var(--df-tertiary); }

    .qa-tabs-header {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--df-border-subtle);
      padding-bottom: 0.25rem;
    }

    .tab-btn {
      padding: 0.65rem 1.25rem;
      background: transparent;
      border: none;
      color: var(--df-on-surface-variant);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all var(--df-transition-fast);
    }

    .tab-btn.active {
      color: var(--df-primary);
      border-bottom-color: var(--df-primary);
    }

    .table-card {
      padding: 1.25rem;
    }

    .table-filters-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .filter-select {
      width: auto;
      min-width: 220px;
    }

    .tc-title-cell {
      display: flex;
      flex-direction: column;
    }

    .suite-name {
      color: var(--df-text-muted);
    }

    .tc-type-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
    }

    .result-text {
      color: var(--df-on-surface-variant);
    }

    .tc-action-btns {
      display: flex;
      gap: 0.35rem;
    }

    .pass-btn {
      background-color: rgba(107, 227, 161, 0.15);
      color: var(--df-success);
      padding: 0.25rem 0.55rem;
    }

    .fail-btn {
      background-color: rgba(255, 180, 171, 0.15);
      color: var(--df-error);
      padding: 0.25rem 0.55rem;
    }

    /* Bugs grid */
    .bugs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.25rem;
    }

    .bug-item {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background-color: var(--df-surface-container-low);
      padding: 1.25rem;
    }

    .bug-item.bug-critical {
      border-color: rgba(255, 180, 171, 0.35);
    }

    .bug-header-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bug-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .bug-desc {
      color: var(--df-on-surface-variant);
    }

    .steps-box {
      background-color: var(--df-surface-container-lowest);
      padding: 0.65rem 0.85rem;
      border-radius: var(--df-radius-default);
    }

    .steps-label {
      color: var(--df-text-muted);
      font-weight: 600;
    }

    .steps-pre {
      font-family: inherit;
      color: var(--df-on-surface);
      white-space: pre-wrap;
      margin-top: 0.25rem;
    }

    .bug-footer-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.5rem;
      border-top: 1px solid var(--df-border-subtle);
    }

    .bug-status-select {
      width: auto;
      padding: 0.3rem 0.65rem;
      font-size: 0.775rem;
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
export class QaDashboardComponent {
  readonly qaService = inject(QaService);
  readonly projectService = inject(ProjectService);
  readonly notificationService = inject(NotificationService);

  readonly activeTab = signal<'tests' | 'bugs'>('tests');
  readonly openNewTestModal = signal<boolean>(false);
  readonly openNewBugModal = signal<boolean>(false);

  newTest = {
    title: '',
    projectId: 'prj-01',
    type: 'integration' as TestType,
    suite: 'Core Services',
    expectedResult: '',
    status: 'untested' as any,
    tester: 'Mariana Ruiz'
  };

  newBug = {
    title: '',
    projectId: 'prj-01',
    description: '',
    stepsToReproduce: '',
    severity: 'high' as BugSeverity,
    status: 'open' as BugStatus,
    reportedBy: 'Mariana Ruiz',
    assignedDev: 'Carlos Vega'
  };

  submitNewTest() {
    if (!this.newTest.title || !this.newTest.expectedResult) {
      this.notificationService.error('Faltan Campos', 'Completa título y resultado esperado.');
      return;
    }

    this.qaService.createTestCase(this.newTest);
    this.openNewTestModal.set(false);
    this.notificationService.success('Caso de Prueba Creado', `Prueba "${this.newTest.title}" añadida a la suite.`);
    this.newTest.title = '';
    this.newTest.expectedResult = '';
  }

  submitNewBug() {
    if (!this.newBug.title) {
      this.notificationService.error('Falta Título', 'Ingresa el título del bug.');
      return;
    }

    this.qaService.createBugReport(this.newBug);
    this.openNewBugModal.set(false);
    this.notificationService.warning('Bug Registrado', `Incidencia "${this.newBug.title}" añadida al tracker.`);
    this.newBug.title = '';
    this.newBug.description = '';
    this.newBug.stepsToReproduce = '';
  }
}
