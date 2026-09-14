import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { QaService } from '../../core/services/qa.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="df-sidebar">
      <!-- Brand Logo Header -->
      <div class="sidebar-brand">
        <div class="brand-logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#aec7f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#aec7f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#aec7f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">DAS<span class="brand-highlight">FUSION</span></span>
          <span class="brand-tag caption">CORE ADMIN</span>
        </div>
      </div>

      <!-- Live Supabase Status Badge -->
      <div class="supabase-status-widget" [routerLink]="['/settings']">
        <div class="status-indicator">
          <span class="pulse-dot" [ngClass]="supabaseService.isConnected() ? 'connected' : 'disconnected'"></span>
          <span class="caption status-text">
            {{ supabaseService.isConnected() ? 'Supabase Conectado' : 'Supabase Offline' }}
          </span>
        </div>
        <span class="caption hub-label">DASFusion-hub</span>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-title caption">GESTIÓN PRINCIPAL</div>

        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="nav-text">Dashboard</span>
        </a>

        <a routerLink="/kanban" routerLinkActive="active" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="3" x2="18" y2="21"></line>
            <line x1="6" y1="3" x2="6" y2="21"></line>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
          <span class="nav-text">Tablero Kanban</span>
          <span class="nav-badge">{{ projectService.totalProjects() }}</span>
        </a>

        <a routerLink="/projects" routerLinkActive="active" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span class="nav-text">Proyectos & Hub</span>
        </a>

        <a routerLink="/clients" routerLinkActive="active" class="nav-link">
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

        <a routerLink="/development" routerLinkActive="active" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span class="nav-text">Tiempos Desarrollo</span>
        </a>

        <a routerLink="/qa-testing" routerLinkActive="active" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span class="nav-text">Pruebas QA & Bugs</span>
          @if (qaService.criticalBugsCount() > 0) {
            <span class="nav-badge badge-danger">{{ qaService.criticalBugsCount() }}</span>
          }
        </a>

        <a routerLink="/deliveries" routerLinkActive="active" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
          <span class="nav-text">Tiempos de Entrega</span>
        </a>

        <div class="nav-section-title caption" style="margin-top: 1rem;">INTEGRACIONES</div>

        <a routerLink="/settings" routerLinkActive="active" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span class="nav-text">Supabase & Sync</span>
        </a>
      </nav>

      <!-- Admin User Footer Info -->
      <div class="sidebar-user-footer">
        <div class="user-avatar">CA</div>
        <div class="user-details">
          <span class="user-name">César Admin</span>
          <span class="caption user-role">Principal Tech Lead</span>
        </div>
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
      padding: 1.5rem 1.25rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-logo-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--df-radius-default);
      background: linear-gradient(135deg, #1b365d 0%, #121316 100%);
      border: 1px solid rgba(174, 199, 247, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.15rem;
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

    .supabase-status-widget {
      margin: 0.5rem 1.25rem 1rem;
      padding: 0.6rem 0.85rem;
      background-color: var(--df-surface-container-lowest);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-default);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all var(--df-transition-fast);
    }

    .supabase-status-widget:hover {
      border-color: rgba(174, 199, 247, 0.4);
      background-color: var(--df-surface-container-low);
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
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--df-border-subtle);
      background-color: var(--df-surface-container-lowest);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--df-tertiary) 0%, var(--df-tertiary-container) 100%);
      color: var(--df-on-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--df-text-primary);
    }

    .user-role {
      font-size: 0.7rem;
      color: var(--df-text-muted);
    }
  `]
})
export class SidebarComponent {
  readonly supabaseService = inject(SupabaseService);
  readonly projectService = inject(ProjectService);
  readonly clientService = inject(ClientService);
  readonly qaService = inject(QaService);
}
