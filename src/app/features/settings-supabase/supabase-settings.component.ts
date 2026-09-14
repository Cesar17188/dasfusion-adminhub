import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { NotificationService } from '../../core/services/notification.service';
import { SupabaseConfig } from '../../core/models/supabase-config.model';

@Component({
  selector: 'app-supabase-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">INTEGRACIÓN DE DATOS</span>
            <span class="caption">Supabase & DASFusion-hub</span>
          </div>
          <h1 class="headline-md page-title">Conexión con Base de Datos Supabase</h1>
          <p class="body-md page-subtitle">
            Configuración de credenciales de Supabase para lectura de formularios y propuestas recibidas en <strong>DASFusion-hub</strong>.
          </p>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            class="df-btn df-btn-secondary" 
            [disabled]="isTesting()" 
            (click)="testConnection()"
          >
            {{ isTesting() ? 'Probando...' : '🔌 Probar Conexión' }}
          </button>
          <button 
            type="button" 
            class="df-btn df-btn-primary" 
            [disabled]="supabaseService.isSyncing()" 
            (click)="triggerSync()"
          >
            {{ supabaseService.isSyncing() ? 'Sincronizando...' : '⚡ Sincronizar Ahora' }}
          </button>
        </div>
      </div>

      <!-- Connection Status Ribbon -->
      <div class="connection-status-card df-card" [class.connected]="supabaseService.isConnected()">
        <div class="status-left">
          <div class="status-indicator-big" [class.online]="supabaseService.isConnected()"></div>
          <div>
            <h3 class="headline-sm status-title">
              {{ supabaseService.isConnected() ? 'Conectado con Supabase (DASFusion-hub)' : 'Desconectado de Supabase' }}
            </h3>
            <p class="caption status-sub">
              {{ supabaseService.isConnected() ? 'El pipeline está sincronizando propuestas y clientes en tiempo real.' : 'Verifica tu URL y Anon Key a continuación.' }}
            </p>
          </div>
        </div>

        <div class="status-right">
          <span class="caption">Última sincronización:</span>
          <strong class="mono last-sync-val">
            {{ supabaseService.lastSyncTime() ? (supabaseService.lastSyncTime() | date:'medium') : 'Recientemente' }}
          </strong>
        </div>
      </div>

      <!-- Credentials & Tables Configuration Form -->
      <div class="settings-two-col">
        <div class="df-card config-form-card">
          <h3 class="headline-sm card-title">Parámetros de API & Autenticación</h3>
          <p class="caption card-desc">Credenciales provistas por la consola de Supabase de DASFusion-hub</p>

          <form (ngSubmit)="saveSettings()" class="settings-form">
            <div class="form-group">
              <label class="df-label">Supabase Project URL *</label>
              <input 
                type="text" 
                class="df-input mono" 
                [(ngModel)]="formData.url" 
                name="url" 
                required 
                placeholder="https://your-project-ref.supabase.co"
              />
            </div>

            <div class="form-group">
              <label class="df-label">Anon / Public API Key *</label>
              <textarea 
                class="df-textarea mono" 
                rows="3" 
                [(ngModel)]="formData.anonKey" 
                name="anonKey" 
                required 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="df-label">Service Role Secret Key (Opcional - Operaciones Admin)</label>
              <input 
                type="password" 
                class="df-input mono" 
                [(ngModel)]="formData.serviceRoleKey" 
                name="serviceKey" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="df-label">Tabla de Clientes</label>
                <input type="text" class="df-input mono" [(ngModel)]="formData.tableNameClients" name="tclients" />
              </div>
              <div class="form-group">
                <label class="df-label">Tabla de Propuestas Hub</label>
                <input type="text" class="df-input mono" [(ngModel)]="formData.tableNameSubmissions" name="tsub" />
              </div>
            </div>

            <div class="form-actions-row">
              <button type="submit" class="df-btn df-btn-primary">
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>

        <!-- Architecture & Synchronization Details -->
        <div class="df-card details-card">
          <h3 class="headline-sm card-title">Esquema de Sincronización</h3>
          <p class="caption card-desc">Flujo de datos automatizado entre DASFusion-hub y Admin CRM</p>

          <div class="sync-features-list">
            <div class="feature-item">
              <div class="feature-icon">📥</div>
              <div class="feature-content">
                <strong>Ingesta de Formularios Hub</strong>
                <p class="caption">Cada vez que un cliente solicita un proyecto en DASFusion-hub, se crea un Lead con score técnico y presupuesto en Supabase.</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🔄</div>
              <div class="feature-content">
                <strong>Modo Híbrido Resiliente</strong>
                <p class="caption">El CRM opera con almacenamiento local reactivo y sincronización bidireccional con Supabase para garantizar 100% de disponibilidad.</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <div class="feature-content">
                <strong>Seguridad & Row Level Security (RLS)</strong>
                <p class="caption">Soporte nativo para políticas RLS de Supabase mediante tokens JWT de administrador.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sync Logs History -->
      <div class="df-card logs-card">
        <div class="logs-header">
          <div>
            <h3 class="headline-sm card-title">Historial de Sincronizaciones</h3>
            <p class="caption card-desc">Eventos de lectura y actualización con la base de datos de DASFusion-hub</p>
          </div>
          <button type="button" class="df-btn df-btn-sm df-btn-ghost" (click)="supabaseService.clearLogs()">
            Limpiar Logs
          </button>
        </div>

        <div class="df-table-container" style="margin-top: 1rem;">
          <table class="df-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Registros</th>
                <th>Detalle del Evento</th>
              </tr>
            </thead>
            <tbody>
              @for (log of supabaseService.syncLogs(); track log.id) {
                <tr>
                  <td><span class="mono caption">{{ log.timestamp | date:'short' }}</span></td>
                  <td><span class="caption mono type-tag">{{ log.type }}</span></td>
                  <td>
                    <span 
                      class="df-pill" 
                      [class.df-pill-success]="log.status === 'success'"
                      [class.df-pill-warning]="log.status === 'warning'"
                      [class.df-pill-error]="log.status === 'error'"
                    >
                      {{ log.status }}
                    </span>
                  </td>
                  <td><span class="mono">{{ log.recordsSynced }}</span></td>
                  <td><span class="body-sm">{{ log.message }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
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

    /* Connection status card */
    .connection-status-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, var(--df-surface-container) 0%, var(--df-surface-container-low) 100%);
      border: 1px solid var(--df-border-subtle);
    }

    .connection-status-card.connected {
      border-color: rgba(107, 227, 161, 0.35);
      background: linear-gradient(135deg, rgba(0, 57, 28, 0.3) 0%, var(--df-surface-container) 100%);
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .status-indicator-big {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: var(--df-error);
    }

    .status-indicator-big.online {
      background-color: var(--df-success);
      box-shadow: 0 0 15px var(--df-success);
    }

    .status-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .status-sub {
      color: var(--df-text-muted);
    }

    .status-right {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .last-sync-val {
      color: var(--df-primary);
      font-size: 0.9rem;
    }

    .settings-two-col {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 1024px) {
      .settings-two-col {
        grid-template-columns: 1fr;
      }
    }

    .config-form-card, .details-card, .logs-card {
      padding: 1.5rem;
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .card-desc {
      color: var(--df-text-muted);
      margin-top: 0.15rem;
      margin-bottom: 1.25rem;
    }

    .settings-form {
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

    .form-actions-row {
      margin-top: 0.5rem;
      display: flex;
      justify-content: flex-end;
    }

    /* Features List */
    .sync-features-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background-color: var(--df-surface-container-low);
      padding: 1rem;
      border-radius: var(--df-radius-default);
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    .feature-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .feature-content strong {
      color: var(--df-text-primary);
      font-size: 0.9rem;
    }

    .logs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .type-tag {
      background-color: var(--df-surface-container-highest);
      padding: 0.15rem 0.4rem;
      border-radius: var(--df-radius-sm);
    }
  `]
})
export class SupabaseSettingsComponent {
  readonly supabaseService = inject(SupabaseService);
  readonly notificationService = inject(NotificationService);

  readonly isTesting = signal<boolean>(false);

  formData: SupabaseConfig = { ...this.supabaseService.config() };

  async testConnection() {
    this.isTesting.set(true);
    const res = await this.supabaseService.testConnection();
    this.isTesting.set(false);

    if (res.success) {
      this.notificationService.success('Conexión Verificada', res.message);
    } else {
      this.notificationService.error('Error de Conexión', res.message);
    }
  }

  async triggerSync() {
    const res = await this.supabaseService.triggerManualSync();
    if (res.success) {
      this.notificationService.success('Sincronización Completada', res.message);
    } else {
      this.notificationService.error('Error al Sincronizar', res.message);
    }
  }

  async saveSettings() {
    const res = await this.supabaseService.saveConfig(this.formData);
    if (res.success) {
      this.notificationService.success('Configuración Guardada', 'Los parámetros de Supabase se actualizaron.');
    } else {
      this.notificationService.warning('Configuración Guardada', res.message);
    }
  }
}
