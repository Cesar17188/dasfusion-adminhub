import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { QaService } from '../../core/services/qa.service';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  template: `
    <aside class="df-sidebar">
      <!-- Brand Logo Header with Mobile Close -->
      <div class="sidebar-brand">
        <div class="brand-left">
          <img 
            ngSrc="https://whlxncobakktxghxdyfw.supabase.co/storage/v1/object/public/general/logoDasfusionDegradado.webp" 
            alt="DASFusion Logo" 
            class="brand-logo-img" 
            width="36"
            height="36"
            priority
          />
          <div class="brand-text">
            <span class="brand-name">DAS<span class="brand-highlight">FUSION</span></span>
            <span class="brand-tag caption">CORE ADMIN</span>
          </div>
        </div>

        <button 
          type="button" 
          class="df-btn-icon df-btn-ghost mobile-close-drawer-btn" 
          (click)="layoutService.closeMobileSidebar()"
          title="Cerrar Menú"
        >
          ✕
        </button>
      </div>

      <!-- Live Supabase Status Badge -->
      <div class="supabase-status-widget">
        <div class="status-indicator">
          <span class="pulse-dot" [ngClass]="supabaseService.isConnected() ? 'connected' : 'disconnected'"></span>
          <span class="caption status-text">
            {{ supabaseService.isConnected() ? 'Supabase Online' : 'Supabase Offline' }}
          </span>
        </div>
        <span class="caption hub-label">DASFusion-hub</span>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-title caption">GESTIÓN PRINCIPAL</div>

        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="nav-text">Dashboard</span>
        </a>

        <a routerLink="/kanban" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="3" x2="18" y2="21"></line>
            <line x1="6" y1="3" x2="6" y2="21"></line>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
          <span class="nav-text">Tablero Kanban</span>
          <span class="nav-badge">{{ projectService.totalProjects() }}</span>
        </a>

        <a routerLink="/projects" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span class="nav-text">Proyectos & Hub</span>
        </a>

        <a routerLink="/clients" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="nav-text">Clientes CRM</span>
          <span class="nav-badge">{{ clientService.totalClients() }}</span>
        </a>

        <div class="nav-section-title caption" style="margin-top: 1rem;">CICLO DE SOFTWARE</div>

        <a routerLink="/development" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span class="nav-text">Tiempos Desarrollo</span>
        </a>

        <a routerLink="/qa-testing" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span class="nav-text">Pruebas QA & Bugs</span>
          @if (qaService.criticalBugsCount() > 0) {
            <span class="nav-badge badge-danger">{{ qaService.criticalBugsCount() }}</span>
          }
        </a>

        <a routerLink="/deliveries" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
          <span class="nav-text">Tiempos de Entrega</span>
        </a>

        <div class="nav-section-title caption" style="margin-top: 1rem;">EQUIPO & ACCESOS</div>

        <a routerLink="/users" routerLinkActive="active" class="nav-link" (click)="layoutService.closeMobileSidebar()">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="nav-text">Administradores</span>
        </a>
      </nav>

      <!-- User Profile & Logout Footer -->
      <div class="sidebar-user-footer">
        <div class="user-avatar">
          {{ (authService.currentProfile()?.fullName || 'Admin').charAt(0) }}
        </div>
        <div class="user-details">
          <span class="user-name">{{ authService.currentProfile()?.fullName || 'César Morales' }}</span>
          <div class="role-badge-row">
            <span class="df-pill" [class.df-pill-primary]="authService.isAdmin()" [class.df-pill-success]="authService.isClient()">
              {{ (authService.currentProfile()?.role || 'admin').toUpperCase() }}
            </span>
          </div>
        </div>
        <button 
          type="button" 
          class="df-btn-icon df-btn-ghost logout-btn" 
          (click)="authService.logout()"
          title="Cerrar sesión"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .df-sidebar {
      width: 270px;
      height: 100vh;
      background-color: var(--df-contrast-black);
      border-right: 1px solid var(--df-border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 100;
      user-select: none;
    }

    .sidebar-brand {
      padding: 1.25rem 1.25rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-logo-img {
      width: 36px;
      height: 36px;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: var(--df-text-primary);
    }

    .brand-highlight {
      color: var(--df-primary);
    }

    .brand-tag {
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      color: var(--df-text-muted);
    }

    .mobile-close-drawer-btn {
      display: none;
      color: var(--df-text-muted);
      font-size: 1.1rem;
    }

    .supabase-status-widget {
      margin: 0.5rem 1.25rem 0.85rem;
      padding: 0.55rem 0.85rem;
      background-color: var(--df-surface-container-lowest);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-default);
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all var(--df-transition-fast);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .pulse-dot.connected {
      background-color: var(--df-success);
      box-shadow: 0 0 8px var(--df-success);
    }

    .pulse-dot.disconnected {
      background-color: var(--df-error);
    }

    .status-text {
      font-size: 0.725rem;
      font-weight: 600;
      color: var(--df-on-surface);
    }

    .hub-label {
      font-size: 0.65rem;
      color: var(--df-primary);
      background: rgba(174, 199, 247, 0.1);
      padding: 0.15rem 0.4rem;
      border-radius: var(--df-radius-sm);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 0 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      -webkit-overflow-scrolling: touch;
    }

    .nav-section-title {
      padding: 0.5rem 0.6rem 0.25rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--df-text-muted);
      letter-spacing: 0.08em;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: var(--df-radius-default);
      color: var(--df-on-surface-variant);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--df-transition-fast);
      position: relative;
    }

    .nav-link:hover {
      background-color: var(--df-surface-container-high);
      color: var(--df-text-primary);
    }

    .nav-link.active {
      background-color: var(--df-primary-container);
      color: var(--df-primary-fixed);
      font-weight: 600;
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 3px;
      background-color: var(--df-primary);
      border-radius: 0 2px 2px 0;
    }

    .nav-icon {
      flex-shrink: 0;
      opacity: 0.85;
    }

    .nav-link.active .nav-icon {
      opacity: 1;
      stroke: var(--df-primary);
    }

    .nav-text {
      flex: 1;
    }

    .nav-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: var(--df-radius-full);
      background-color: var(--df-surface-container-highest);
      color: var(--df-on-surface);
    }

    .nav-badge.badge-danger {
      background-color: var(--df-error-container);
      color: var(--df-error);
    }

    .sidebar-user-footer {
      padding: 0.85rem 1rem;
      border-top: 1px solid var(--df-border-subtle);
      background-color: var(--df-surface-container-lowest);
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--df-primary) 0%, var(--df-primary-container) 100%);
      color: var(--df-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--df-text-primary);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .role-badge-row {
      margin-top: 0.15rem;
    }

    .role-badge-row .df-pill {
      font-size: 0.6rem;
      padding: 0.05rem 0.35rem;
    }

    .logout-btn {
      color: var(--df-text-muted);
      padding: 0.35rem;
      border-radius: var(--df-radius-sm);
    }

    .logout-btn:hover {
      color: var(--df-error);
      background-color: var(--df-error-container);
    }

    /* Mobile Off-Canvas Drawer Behavior */
    @media (max-width: 1023px) {
      .df-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 280px;
        transform: translateX(-100%);
        transition: transform var(--df-transition-smooth);
        z-index: 1000;
        box-shadow: 4px 0 25px rgba(0, 0, 0, 0.7);
      }

      .df-sidebar.mobile-open {
        transform: translateX(0);
      }

      .mobile-close-drawer-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  `]
})
export class SidebarComponent {
  readonly supabaseService = inject(SupabaseService);
  readonly projectService = inject(ProjectService);
  readonly clientService = inject(ClientService);
  readonly qaService = inject(QaService);
  readonly authService = inject(AuthService);
  readonly layoutService = inject(LayoutService);
}
