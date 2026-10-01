import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../core/services/user-management.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { AdminUser, CreateAdminDto } from '../../core/models/user-management.model';
import { UserRole } from '../../core/models/profile.model';

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
            <span class="caption">Supabase Auth & Profiles</span>
          </div>
          <h1 class="headline-md page-title">Gestión de Usuarios y Roles</h1>
          <p class="body-md page-subtitle">
            Administra los roles de acceso (<strong>admin</strong> y <strong>client</strong>), asigna contraseñas provisionales y gestiona permisos del sistema.
          </p>
        </div>

        <button type="button" class="df-btn df-btn-primary btn-new-admin" (click)="openCreateModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>+ Nuevo Usuario</span>
        </button>
      </div>

      <!-- KPI Metrics Row -->
      <div class="metrics-grid">
        <div class="metric-card df-card">
          <div class="metric-icon-box">👥</div>
          <div class="metric-info">
            <span class="caption metric-label">Total Usuarios</span>
            <h3 class="headline-sm metric-value">{{ userService.totalUsers() }}</h3>
          </div>
        </div>

        <div class="metric-card df-card">
          <div class="metric-icon-box admin-badge-box">🛡️</div>
          <div class="metric-info">
            <span class="caption metric-label">Administradores</span>
            <h3 class="headline-sm metric-value">{{ userService.totalAdmins() }}</h3>
          </div>
        </div>

        <div class="metric-card df-card">
          <div class="metric-icon-box client-badge-box">👤</div>
          <div class="metric-info">
            <span class="caption metric-label">Clientes / Portal</span>
            <h3 class="headline-sm metric-value">{{ userService.totalClients() }}</h3>
          </div>
        </div>

        <div class="metric-card df-card">
          <div class="metric-icon-box warning">🔑</div>
          <div class="metric-info">
            <span class="caption metric-label">Claves Provisionales</span>
            <h3 class="headline-sm metric-value">{{ userService.provisionalAdmins() }}</h3>
          </div>
        </div>
      </div>

      <!-- Search & Filter Controls Bar -->
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

        <!-- Role Filter Tabs -->
        <div class="role-filter-group">
          <button 
            type="button" 
            class="role-filter-btn" 
            [class.active]="userService.roleFilter() === 'all'"
            (click)="userService.roleFilter.set('all')"
          >
            Todos ({{ userService.totalUsers() }})
          </button>
          <button 
            type="button" 
            class="role-filter-btn" 
            [class.active]="userService.roleFilter() === 'admin'"
            (click)="userService.roleFilter.set('admin')"
          >
            🛡️ Admins ({{ userService.totalAdmins() }})
          </button>
          <button 
            type="button" 
            class="role-filter-btn" 
            [class.active]="userService.roleFilter() === 'client'"
            (click)="userService.roleFilter.set('client')"
          >
            👤 Clientes ({{ userService.totalClients() }})
          </button>
        </div>

        <button type="button" class="df-btn df-btn-secondary btn-sync" (click)="userService.syncWithSupabase()">
          🔄 Sincronizar Supabase
        </button>
      </div>

      <!-- Users Table -->
      <div class="df-table-container">
        <table class="df-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo Electrónico</th>
              <th>Rol Actual</th>
              <th>Cambiar Rol</th>
              <th>Estado Acceso</th>
              <th>Clave Provisional</th>
              <th>Fecha Registro</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (user of userService.filteredAdmins(); track user.id) {
              <tr [class.row-highlight-admin]="user.role === 'admin'">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-circle" [class.avatar-client]="user.role === 'client'">
                      {{ user.fullName.charAt(0) }}
                    </div>
                    <div>
                      <strong class="user-name-text">{{ user.fullName }}</strong>
                      <span class="caption user-title-text">{{ user.professionalTitle }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="mono email-text">{{ user.email }}</span>
                </td>
                <td>
                  @if (user.role === 'admin') {
                    <span class="df-pill df-pill-primary role-badge">
                      🛡️ ADMIN
                    </span>
                  } @else if (user.role === 'client') {
                    <span class="df-pill df-pill-success role-badge">
                      👤 CLIENTE
                    </span>
                  } @else {
                    <span class="df-pill df-pill-warning role-badge">
                      💻 {{ user.role.toUpperCase() }}
                    </span>
                  }
                </td>
                <td>
                  <!-- Fast Role Toggle Switcher -->
                  <div class="role-selector-wrapper">
                    <select 
                      class="df-input df-select-sm role-select-input"
                      [ngModel]="user.role"
                      (ngModelChange)="onRoleChangeRequested(user, $event)"
                      [disabled]="user.email === 'admin@dasfusion.io'"
                    >
                      <option value="admin">🛡️ Rol Admin</option>
                      <option value="client">👤 Rol Cliente</option>
                      <option value="developer">💻 Rol Developer</option>
                    </select>
                  </div>
                </td>
                <td>
                  @if (user.status === 'provisional_password') {
                    <span class="df-pill df-pill-warning">Clave Provisional</span>
                  } @else {
                    <span class="df-pill df-pill-success">Activo</span>
                  }
                </td>
                <td>
                  @if (user.provisionalPassword) {
                    <div class="password-cell">
                      <span class="mono password-val">
                        {{ visiblePasswords()[user.id] ? user.provisionalPassword : '••••••••' }}
                      </span>
                      <button 
                        type="button" 
                        class="df-btn-icon df-btn-ghost btn-tiny"
                        (click)="togglePasswordVisibility(user.id)"
                        title="Ver / Ocultar"
                      >
                        {{ visiblePasswords()[user.id] ? '🙈' : '👁️' }}
                      </button>
                      <button 
                        type="button" 
                        class="df-btn-icon df-btn-ghost btn-tiny"
                        (click)="copyCredentials(user)"
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
                  <span class="caption">{{ user.createdAt | date:'mediumDate' }}</span>
                </td>
                <td>
                  <div class="actions-cell">
                    @if (user.role === 'admin') {
                      <button 
                        type="button" 
                        class="df-btn df-btn-sm df-btn-ghost btn-quick-role"
                        (click)="confirmRoleChange(user, 'client')"
                        [disabled]="user.email === 'admin@dasfusion.io'"
                        title="Cambiar a rol Cliente"
                      >
                        Pasar a Cliente
                      </button>
                    } @else {
                      <button 
                        type="button" 
                        class="df-btn df-btn-sm df-btn-ghost btn-quick-role promote-btn"
                        (click)="confirmRoleChange(user, 'admin')"
                        title="Promover a rol Administrador"
                      >
                        Hacer Admin
                      </button>
                    }

                    <button 
                      type="button" 
                      class="df-btn df-btn-sm df-btn-secondary"
                      (click)="openResetModal(user)"
                      title="Asignar nueva contraseña provisional"
                    >
                      🔑 Clave
                    </button>

                    <button 
                      type="button" 
                      class="df-btn-icon df-btn-ghost text-danger"
                      (click)="confirmDelete(user)"
                      [disabled]="user.email === 'admin@dasfusion.io'"
                      title="Eliminar usuario"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8">
                  <app-empty-state 
                    title="No se encontraron usuarios"
                    description="Intenta buscar con otros términos o ajusta el filtro de roles (Todos, Admins, Clientes)."
                  ></app-empty-state>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal: Crear Nuevo Usuario -->
      <app-modal 
        [isOpen]="isCreateOpen()" 
        title="Registrar Nuevo Usuario / Administrador" 
        size="md" 
        (closed)="isCreateOpen.set(false)"
      >
        <form (ngSubmit)="submitCreateAdmin()" class="modal-form">
          <p class="body-sm form-intro">
            Crea un acceso en Supabase Auth y asigna su rol en la tabla de perfiles (<strong>admin</strong> para acceso al CRM o <strong>client</strong> para acceso al Portal de Clientes).
          </p>

          <div class="form-group">
            <label class="df-label">Rol del Usuario *</label>
            <div class="role-selection-grid">
              <label class="role-radio-card" [class.selected]="newAdmin.role === 'admin'">
                <input 
                  type="radio" 
                  name="userRole" 
                  value="admin" 
                  [(ngModel)]="newAdmin.role"
                  (change)="onNewUserRoleChanged('admin')"
                />
                <div class="role-card-content">
                  <span class="role-icon">🛡️</span>
                  <div>
                    <strong>Administrador</strong>
                    <span class="caption">Acceso completo al CRM y proyectos</span>
                  </div>
                </div>
              </label>

              <label class="role-radio-card" [class.selected]="newAdmin.role === 'client'">
                <input 
                  type="radio" 
                  name="userRole" 
                  value="client" 
                  [(ngModel)]="newAdmin.role"
                  (change)="onNewUserRoleChanged('client')"
                />
                <div class="role-card-content">
                  <span class="role-icon">👤</span>
                  <div>
                    <strong>Cliente</strong>
                    <span class="caption">Acceso al portal y seguimiento</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

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
              [placeholder]="newAdmin.role === 'admin' ? 'Ej. Principal Tech Lead' : 'Ej. Cliente Corporativo / Director'" 
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
            <button type="submit" class="df-btn df-btn-primary">Guardar Usuario</button>
          </div>
        </form>
      </app-modal>

      <!-- Modal: Confirmar Cambio de Rol -->
      <app-modal 
        [isOpen]="isConfirmRoleOpen()" 
        title="Confirmar Cambio de Rol" 
        size="sm" 
        (closed)="isConfirmRoleOpen.set(false)"
      >
        @if (selectedUserForRoleChange()) {
          <div class="modal-form">
            <div class="role-change-preview">
              <div class="role-badge-from">
                <span class="caption">Rol Actual:</span>
                <span class="df-pill" [class.df-pill-primary]="selectedUserForRoleChange()?.role === 'admin'" [class.df-pill-success]="selectedUserForRoleChange()?.role === 'client'">
                  {{ selectedUserForRoleChange()?.role?.toUpperCase() }}
                </span>
              </div>
              <span class="arrow-indicator">➔</span>
              <div class="role-badge-to">
                <span class="caption">Nuevo Rol:</span>
                <span class="df-pill" [class.df-pill-primary]="targetRoleForChange() === 'admin'" [class.df-pill-success]="targetRoleForChange() === 'client'">
                  {{ targetRoleForChange().toUpperCase() }}
                </span>
              </div>
            </div>

            <p class="body-sm">
              ¿Deseas cambiar el rol de <strong>{{ selectedUserForRoleChange()?.fullName }}</strong> ({{ selectedUserForRoleChange()?.email }}) a 
              <strong>{{ targetRoleForChange() === 'admin' ? 'Administrador' : 'Cliente' }}</strong>?
            </p>

            <div class="role-impact-note" [class.warning-note]="targetRoleForChange() === 'client'">
              @if (targetRoleForChange() === 'client') {
                ⚠️ <strong>Aviso:</strong> Al pasar a rol <em>Cliente</em>, este usuario no podrá iniciar sesión en este panel administrativo y solo tendrá acceso a los servicios de portal para clientes.
              } @else {
                🛡️ <strong>Aviso:</strong> Al pasar a rol <em>Administrador</em>, este usuario obtendrá acceso completo para gestionar el CRM, Kanban, proyectos y configuraciones.
              }
            </div>

            <div footer>
              <button type="button" class="df-btn df-btn-ghost" (click)="isConfirmRoleOpen.set(false)">Cancelar</button>
              <button type="button" class="df-btn df-btn-primary" (click)="executeRoleChange()">Confirmar Cambio</button>
            </div>
          </div>
        }
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

    .metric-icon-box.admin-badge-box {
      background: rgba(174, 199, 247, 0.15);
      border: 1px solid rgba(174, 199, 247, 0.3);
    }

    .metric-icon-box.client-badge-box {
      background: rgba(107, 227, 161, 0.12);
      border: 1px solid rgba(107, 227, 161, 0.25);
    }

    .metric-icon-box.warning {
      background: rgba(246, 178, 107, 0.1);
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

    @media (min-width: 900px) {
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

    @media (min-width: 900px) {
      .btn-sync {
        width: auto;
      }
    }

    .search-box {
      position: relative;
      flex: 1;
      width: 100%;
      min-width: 240px;
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

    /* Role Filter Tabs */
    .role-filter-group {
      display: flex;
      align-items: center;
      background: var(--df-surface-container-high);
      padding: 0.25rem;
      border-radius: var(--df-radius-default);
      gap: 0.25rem;
      overflow-x: auto;
    }

    .role-filter-btn {
      background: transparent;
      border: none;
      color: var(--df-text-secondary);
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: var(--df-radius-sm);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--df-transition-fast);
    }

    .role-filter-btn:hover {
      color: var(--df-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .role-filter-btn.active {
      background: var(--df-surface-container-highest);
      color: var(--df-primary);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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

    .user-avatar-circle.avatar-client {
      background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
      color: #e8f5e9;
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

    .role-badge {
      font-size: 0.725rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .role-selector-wrapper {
      display: inline-block;
    }

    .role-select-input {
      font-size: 0.8rem;
      padding: 0.3rem 0.6rem;
      border-radius: var(--df-radius-sm);
      background-color: var(--df-surface-container-high);
      border: 1px solid var(--df-border-subtle);
      color: var(--df-text-primary);
      cursor: pointer;
    }

    .role-select-input:focus {
      border-color: var(--df-primary);
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
      gap: 0.4rem;
    }

    .btn-quick-role {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      color: var(--df-text-secondary);
      border: 1px solid var(--df-border-subtle);
    }

    .btn-quick-role:hover {
      color: var(--df-text-primary);
      border-color: var(--df-primary);
    }

    .btn-quick-role.promote-btn {
      color: var(--df-primary);
      border-color: rgba(174, 199, 247, 0.4);
      background: rgba(174, 199, 247, 0.05);
    }

    .btn-quick-role.promote-btn:hover {
      background: rgba(174, 199, 247, 0.15);
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

    .role-selection-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .role-radio-card {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem;
      background: var(--df-surface-container-high);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-default);
      cursor: pointer;
      transition: all var(--df-transition-fast);
    }

    .role-radio-card input[type="radio"] {
      position: absolute;
      opacity: 0;
    }

    .role-radio-card.selected {
      border-color: var(--df-primary);
      background: rgba(174, 199, 247, 0.1);
      box-shadow: 0 0 0 1px var(--df-primary);
    }

    .role-card-content {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .role-icon {
      font-size: 1.35rem;
    }

    .role-card-content strong {
      display: block;
      font-size: 0.85rem;
      color: var(--df-text-primary);
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

    /* Role Change Preview Modal */
    .role-change-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--df-surface-container-high);
      border-radius: var(--df-radius-default);
    }

    .role-badge-from, .role-badge-to {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }

    .arrow-indicator {
      font-size: 1.25rem;
      color: var(--df-text-muted);
    }

    .role-impact-note {
      padding: 0.75rem 1rem;
      border-radius: var(--df-radius-default);
      font-size: 0.825rem;
      line-height: 1.4;
      background: rgba(174, 199, 247, 0.1);
      border-left: 3px solid var(--df-primary);
      color: var(--df-text-primary);
    }

    .role-impact-note.warning-note {
      background: rgba(246, 178, 107, 0.12);
      border-left-color: var(--df-warning);
    }
  `]
})
export class AdminUsersComponent {
  readonly userService = inject(UserManagementService);
  readonly notificationService = inject(NotificationService);

  readonly isCreateOpen = signal<boolean>(false);
  readonly isResetOpen = signal<boolean>(false);
  readonly isConfirmRoleOpen = signal<boolean>(false);
  readonly selectedUserForRoleChange = signal<AdminUser | null>(null);
  readonly targetRoleForChange = signal<UserRole>('admin');

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

  onNewUserRoleChanged(role: UserRole) {
    this.newAdmin.role = role;
    if (role === 'admin' && (!this.newAdmin.professionalTitle || this.newAdmin.professionalTitle.includes('Cliente'))) {
      this.newAdmin.professionalTitle = 'Administrador del Sistema';
    } else if (role === 'client' && (!this.newAdmin.professionalTitle || this.newAdmin.professionalTitle.includes('Administrador'))) {
      this.newAdmin.professionalTitle = 'Cliente / Usuario';
    }
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
    const roleLabel = admin.role === 'admin' ? 'Administrador' : 'Cliente';
    const text = `🔐 CREDENCIALES DE ACCESO DASFUSION\n\n👤 Nombre: ${admin.fullName}\n📧 Correo: ${admin.email}\n🏷️ Rol: ${roleLabel}\n🔑 Clave Provisional: ${admin.provisionalPassword || '(Clave personalizada)'}\n🔗 Ingreso: http://localhost:4200/login`;
    
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

  onRoleChangeRequested(user: AdminUser, newRole: UserRole) {
    if (user.role === newRole) return;
    this.confirmRoleChange(user, newRole);
  }

  confirmRoleChange(user: AdminUser, newRole: UserRole) {
    if (user.email === 'admin@dasfusion.io' && newRole !== 'admin') {
      this.notificationService.error('Acción Denegada', 'No puedes cambiar el rol del administrador principal.');
      return;
    }

    this.selectedUserForRoleChange.set(user);
    this.targetRoleForChange.set(newRole);
    this.isConfirmRoleOpen.set(true);
  }

  async executeRoleChange() {
    const user = this.selectedUserForRoleChange();
    const newRole = this.targetRoleForChange();

    if (!user) return;

    this.isConfirmRoleOpen.set(false);
    await this.userService.updateUserRole(user.id, newRole);
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
    if (confirm(`¿Estás seguro de revocar el acceso y eliminar al usuario "${admin.fullName}" (${admin.email})?`)) {
      this.userService.deleteAdmin(admin.id);
    }
  }
}

