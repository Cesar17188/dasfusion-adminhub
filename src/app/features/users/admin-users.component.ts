import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../core/services/user-management.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AdminUser, CreateAdminDto } from '../../core/models/user-management.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, EmptyStateComponent],
  template: `
    <div class="admin-users-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-tag">
            <span class="df-pill df-pill-primary">SEGURIDAD & ROLES</span>
            <span class="caption">Supabase Profiles</span>
          </div>
          <h1 class="headline-md page-title">Administración de Usuarios del Sistema</h1>
          <p class="body-md page-subtitle">
            Gestión de cuentas con rol <strong>admin</strong>, asignación de contraseñas provisionales y permisos del CRM.
          </p>
        </div>

        <button type="button" class="df-btn df-btn-primary btn-new-admin" (click)="openCreateModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>+ Nuevo Administrador</span>
        </button>
      </div>

      <!-- KPI Metrics Row -->
      <div class="metrics-grid">
        <div class="metric-card df-card">
          <div class="metric-icon-box">🛡️</div>
          <div class="metric-info">
            <span class="caption metric-label">Total Administradores</span>
            <h3 class="headline-sm metric-value">{{ userService.totalAdmins() }}</h3>
          </div>
        </div>

        <div class="metric-card df-card">
          <div class="metric-icon-box online">⚡</div>
          <div class="metric-info">
            <span class="caption metric-label">Cuentas Activas</span>
            <h3 class="headline-sm metric-value">{{ userService.activeAdmins() }}</h3>
          </div>
        </div>

        <div class="metric-card df-card">
          <div class="metric-icon-box warning">🔑</div>
          <div class="metric-info">
            <span class="caption metric-label">Con Clave Provisional</span>
            <h3 class="headline-sm metric-value">{{ userService.provisionalAdmins() }}</h3>
          </div>
        </div>

        <div class="metric-card df-card">
          <div class="metric-icon-box rls">🔒</div>
          <div class="metric-info">
            <span class="caption metric-label">Nivel de Seguridad</span>
            <h3 class="headline-sm metric-value" style="color: var(--df-success);">RLS Activo</h3>
          </div>
        </div>
      </div>

      <!-- Search & Controls Bar -->
      <div class="controls-bar df-card">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo electrónico o cargo..." 
            class="df-input search-input"
            [ngModel]="userService.searchQuery()"
            (ngModelChange)="userService.searchQuery.set($event)"
          />
        </div>
        <button type="button" class="df-btn df-btn-secondary btn-sync" (click)="userService.syncWithSupabase()">
          🔄 Sincronizar con Supabase
        </button>
      </div>

      <!-- Admins Table -->
      <div class="df-table-container">
        <table class="df-table">
          <thead>
            <tr>
              <th>Administrador</th>
              <th>Correo Electrónico</th>
              <th>Rol Base de Datos</th>
              <th>Estado de Acceso</th>
              <th>Clave Provisional</th>
              <th>Fecha de Registro</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (admin of userService.filteredAdmins(); track admin.id) {
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-circle">
                      {{ admin.fullName.charAt(0) }}
                    </div>
                    <div>
                      <strong class="user-name-text">{{ admin.fullName }}</strong>
                      <span class="caption user-title-text">{{ admin.professionalTitle }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="mono email-text">{{ admin.email }}</span>
                </td>
                <td>
                  <span class="df-pill df-pill-primary">
                    {{ admin.role.toUpperCase() }}
                  </span>
                </td>
                <td>
                  @if (admin.status === 'provisional_password') {
                    <span class="df-pill df-pill-warning">Clave Provisional</span>
                  } @else {
                    <span class="df-pill df-pill-success">Activo</span>
                  }
                </td>
                <td>
                  @if (admin.provisionalPassword) {
                    <div class="password-cell">
                      <span class="mono password-val">
                        {{ visiblePasswords()[admin.id] ? admin.provisionalPassword : '••••••••' }}
                      </span>
                      <button 
                        type="button" 
                        class="df-btn-icon df-btn-ghost btn-tiny"
                        (click)="togglePasswordVisibility(admin.id)"
                        title="Ver / Ocultar"
                      >
                        {{ visiblePasswords()[admin.id] ? '🙈' : '👁️' }}
                      </button>
                      <button 
                        type="button" 
                        class="df-btn-icon df-btn-ghost btn-tiny"
                        (click)="copyCredentials(admin)"
                        title="Copiar credenciales completas"
                      >
                        📋
                      </button>
                    </div>
                  } @else {
                    <span class="caption" style="color: var(--df-text-muted);">Definida por usuario</span>
                  }
                </td>
                <td>
                  <span class="caption">{{ admin.createdAt | date:'mediumDate' }}</span>
                </td>
                <td>
                  <div class="actions-cell">
                    <button 
                      type="button" 
                      class="df-btn df-btn-sm df-btn-secondary"
                      (click)="openResetModal(admin)"
                      title="Asignar nueva contraseña provisional"
                    >
                      🔑 Cambiar Clave
                    </button>
                    <button 
                      type="button" 
                      class="df-btn-icon df-btn-ghost text-danger"
                      (click)="confirmDelete(admin)"
                      title="Eliminar administrador"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  <app-empty-state 
                    title="No se encontraron administradores"
                    description="Intenta buscar con otros términos o registra un nuevo usuario administrador con su clave provisional."
                  ></app-empty-state>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal: Crear Nuevo Administrador -->
      <app-modal 
        [isOpen]="isCreateOpen()" 
        title="Registrar Nuevo Administrador" 
        size="md" 
        (closed)="isCreateOpen.set(false)"
      >
        <form (ngSubmit)="submitCreateAdmin()" class="modal-form">
          <p class="body-sm form-intro">
            Crea un acceso con rol <strong>admin</strong> en la base de datos Supabase. Podrás asignarle una contraseña provisional de tiempo indefinido para que ingrese de inmediato.
          </p>

          <div class="form-group">
            <label class="df-label">Nombre Completo *</label>
            <input 
              type="text" 
              class="df-input" 
              [(ngModel)]="newAdmin.fullName" 
              name="fname" 
              required 
              placeholder="Ej. Sofía Alarcón" 
            />
          </div>

          <div class="form-group">
            <label class="df-label">Correo Electrónico *</label>
            <input 
              type="email" 
              class="df-input mono" 
              [(ngModel)]="newAdmin.email" 
              name="femail" 
              required 
              placeholder="sofia@dasfusion.io" 
            />
          </div>

          <div class="form-group">
            <label class="df-label">Cargo / Título Profesional</label>
            <input 
              type="text" 
              class="df-input" 
              [(ngModel)]="newAdmin.professionalTitle" 
              name="ftitle" 
              placeholder="Ej. Senior Frontend Developer & QA Lead" 
            />
          </div>

          <div class="form-group">
            <div class="label-with-action">
              <label class="df-label">Contraseña Provisional *</label>
              <button type="button" class="action-link-btn" (click)="generatePasswordForNewAdmin()">
                ⚡ Generar Clave Segura
              </button>
            </div>
            <div class="input-with-tools">
              <input 
                [type]="showNewPass() ? 'text' : 'password'" 
                class="df-input mono" 
                [(ngModel)]="newAdmin.password" 
                name="fpass" 
                required 
                placeholder="Admin#2026!XYZ" 
              />
              <button 
                type="button" 
                class="df-btn-icon df-btn-ghost" 
                (click)="showNewPass.set(!showNewPass())"
                tabindex="-1"
              >
                {{ showNewPass() ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="caption help-text">
              El usuario podrá ingresar con esta contraseña cuantas veces lo desee hasta que decida cambiarla.
            </span>
          </div>

          <div footer>
            <button type="button" class="df-btn df-btn-ghost" (click)="isCreateOpen.set(false)">Cancelar</button>
            <button type="submit" class="df-btn df-btn-primary">Guardar Administrador</button>
          </div>
        </form>
      </app-modal>

      <!-- Modal: Reasignar Contraseña Provisional -->
      <app-modal 
        [isOpen]="isResetOpen()" 
        title="Reasignar Contraseña Provisional" 
        size="md" 
        (closed)="isResetOpen.set(false)"
      >
        @if (selectedAdminForReset()) {
          <div class="modal-form">
            <p class="body-sm">
              Asignarás una nueva contraseña provisional para <strong>{{ selectedAdminForReset()?.fullName }}</strong> ({{ selectedAdminForReset()?.email }}).
            </p>

            <div class="form-group">
              <div class="label-with-action">
                <label class="df-label">Nueva Contraseña Provisional</label>
                <button type="button" class="action-link-btn" (click)="generatePasswordForReset()">
                  ⚡ Generar Automática
                </button>
              </div>
              <input 
                type="text" 
                class="df-input mono" 
                [(ngModel)]="resetPasswordVal" 
                name="rpass" 
                placeholder="NuevaClave#2026" 
              />
            </div>

            <div footer>
              <button type="button" class="df-btn df-btn-ghost" (click)="isResetOpen.set(false)">Cancelar</button>
              <button type="button" class="df-btn df-btn-primary" (click)="submitResetPassword()">Actualizar Clave</button>
            </div>
          </div>
        }
      </app-modal>
    </div>
  `,
  styles: [`
    .admin-users-page {
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
        align-items: flex-start;
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

    .btn-new-admin {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
    }

    @media (min-width: 768px) {
      .btn-new-admin {
        width: auto;
      }
    }

    /* Metrics */
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    @media (min-width: 500px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
      }
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
    }

    .metric-icon-box {
      width: 44px;
      height: 44px;
      border-radius: var(--df-radius-default);
      background: rgba(174, 199, 247, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .metric-icon-box.online {
      background: rgba(107, 227, 161, 0.1);
    }

    .metric-icon-box.warning {
      background: rgba(246, 178, 107, 0.1);
    }

    .metric-icon-box.rls {
      background: rgba(107, 227, 161, 0.1);
    }

    .metric-info {
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      color: var(--df-text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-value {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--df-text-primary);
      margin-top: 0.15rem;
    }

    /* Controls Bar */
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

    .btn-sync {
      width: 100%;
    }

    @media (min-width: 640px) {
      .btn-sync {
        width: auto;
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

    /* Table elements */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .user-avatar-circle {
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
    }

    .user-name-text {
      display: block;
      color: var(--df-text-primary);
    }

    .user-title-text {
      color: var(--df-text-muted);
    }

    .email-text {
      color: var(--df-on-surface);
      font-size: 0.85rem;
    }

    .password-cell {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--df-surface-container-high);
      padding: 0.2rem 0.5rem;
      border-radius: var(--df-radius-sm);
      display: inline-flex;
    }

    .password-val {
      font-size: 0.8rem;
      color: var(--df-primary);
    }

    .btn-tiny {
      padding: 0.15rem 0.35rem;
      font-size: 0.75rem;
    }

    .actions-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .text-danger {
      color: var(--df-error);
    }

    /* Modal Form */
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-intro {
      color: var(--df-text-secondary);
      background: var(--df-surface-container-low);
      padding: 0.75rem 1rem;
      border-radius: var(--df-radius-default);
    }

    .label-with-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .action-link-btn {
      background: none;
      border: none;
      color: var(--df-primary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }

    .action-link-btn:hover {
      text-decoration: underline;
    }

    .input-with-tools {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-with-tools .df-input {
      flex: 1;
    }

    .help-text {
      color: var(--df-text-muted);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
  `]
})
export class AdminUsersComponent {
  readonly userService = inject(UserManagementService);
  readonly notificationService = inject(NotificationService);

  readonly isCreateOpen = signal<boolean>(false);
  readonly isResetOpen = signal<boolean>(false);
  readonly selectedAdminForReset = signal<AdminUser | null>(null);
  readonly showNewPass = signal<boolean>(false);
  readonly visiblePasswords = signal<Record<string, boolean>>({});

  newAdmin: CreateAdminDto = {
    fullName: '',
    email: '',
    password: '',
    professionalTitle: 'Administrador del Sistema',
    role: 'admin'
  };

  resetPasswordVal = '';

  openCreateModal() {
    this.newAdmin = {
      fullName: '',
      email: '',
      password: this.userService.generateProvisionalPassword(),
      professionalTitle: 'Administrador del Sistema',
      role: 'admin'
    };
    this.isCreateOpen.set(true);
  }

  generatePasswordForNewAdmin() {
    this.newAdmin.password = this.userService.generateProvisionalPassword();
    this.showNewPass.set(true);
  }

  generatePasswordForReset() {
    this.resetPasswordVal = this.userService.generateProvisionalPassword();
  }

  togglePasswordVisibility(adminId: string) {
    const current = { ...this.visiblePasswords() };
    current[adminId] = !current[adminId];
    this.visiblePasswords.set(current);
  }

  async copyCredentials(admin: AdminUser) {
    const text = `🔐 CREDENCIALES DE ACCESO DASFUSION ADMIN\n\n👤 Nombre: ${admin.fullName}\n📧 Correo: ${admin.email}\n🔑 Clave Provisional: ${admin.provisionalPassword || '(Clave personalizada)'}\n🔗 Ingreso: http://localhost:4200/login`;
    
    try {
      await navigator.clipboard.writeText(text);
      this.notificationService.success('Credenciales Copiadas', 'Los datos de acceso han sido copiados al portapapeles.');
    } catch {
      this.notificationService.info('Credenciales', text);
    }
  }

  async submitCreateAdmin() {
    if (!this.newAdmin.fullName || !this.newAdmin.email || !this.newAdmin.password) {
      this.notificationService.error('Campos Faltantes', 'Por favor llena nombre, correo y contraseña provisional.');
      return;
    }

    const res = await this.userService.createAdmin(this.newAdmin);
    if (res.success && res.admin) {
      this.isCreateOpen.set(false);
      this.copyCredentials(res.admin);
    }
  }

  openResetModal(admin: AdminUser) {
    this.selectedAdminForReset.set(admin);
    this.resetPasswordVal = this.userService.generateProvisionalPassword();
    this.isResetOpen.set(true);
  }

  async submitResetPassword() {
    if (!this.resetPasswordVal || !this.selectedAdminForReset()) return;
    
    await this.userService.resetPassword(this.selectedAdminForReset()!.id, this.resetPasswordVal);
    this.isResetOpen.set(false);
    
    const admin = this.selectedAdminForReset()!;
    admin.provisionalPassword = this.resetPasswordVal;
    this.copyCredentials(admin);
  }

  confirmDelete(admin: AdminUser) {
    if (confirm(`¿Estás seguro de revocar el acceso y eliminar al administrador "${admin.fullName}" (${admin.email})?`)) {
      this.userService.deleteAdmin(admin.id);
    }
  }
}
