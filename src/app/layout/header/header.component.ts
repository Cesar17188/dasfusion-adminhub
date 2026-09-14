import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="df-header">
      <div class="header-left">
        <div class="breadcrumb-container">
          <span class="caption breadcrumb-root">DASFUSION CORE</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">ADMIN CRM & PIPELINE</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Global Search -->
        <div class="header-search">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar proyectos, clientes, requerimientos..." 
            class="header-search-input"
            [value]="projectService.searchQuery()"
            (input)="onSearchChange($event)"
          />
        </div>

        <!-- Sync Button -->
        <button 
          type="button" 
          class="df-btn df-btn-secondary btn-sync" 
          [disabled]="supabaseService.isSyncing()"
          (click)="handleSync()"
          title="Sincronizar propuestas en vivo con DASFusion-hub (Supabase)"
        >
          <svg 
            class="sync-icon" 
            [class.spin]="supabaseService.isSyncing()"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
          <span>{{ supabaseService.isSyncing() ? 'Sincronizando...' : 'Sincronizar Hub' }}</span>
        </button>

        <!-- Notifications Bell -->
        <div class="notifications-wrapper">
          <button 
            type="button" 
            class="df-btn-icon df-btn-ghost notif-btn"
            (click)="isNotifOpen.set(!isNotifOpen())"
            title="Notificaciones"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            @if (unreadCount() > 0) {
              <span class="notif-badge">{{ unreadCount() }}</span>
            }
          </button>

          @if (isNotifOpen()) {
            <div class="notif-dropdown df-card">
              <div class="notif-dropdown-header">
                <span class="label-md">Notificaciones</span>
                <button type="button" class="caption mark-read-btn" (click)="notificationService.markAllAsRead()">
                  Marcar leídas
                </button>
              </div>
              <div class="notif-list custom-scrollbar">
                @for (item of notificationService.history(); track item.id) {
                  <div class="notif-item" [class.unread]="!item.read">
                    <div class="notif-item-header">
                      <span class="caption notif-item-title">{{ item.title }}</span>
                      <span class="caption notif-time">{{ item.timestamp | date:'shortTime' }}</span>
                    </div>
                    <p class="caption notif-msg">{{ item.message }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .df-header {
      height: 70px;
      background-color: var(--df-surface-container-lowest);
      border-bottom: 1px solid var(--df-border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 90;
      backdrop-filter: blur(10px);
    }

    .breadcrumb-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .breadcrumb-root {
      color: var(--df-text-muted);
      letter-spacing: 0.06em;
    }

    .breadcrumb-sep {
      color: var(--df-outline-variant);
    }

    .breadcrumb-current {
      font-weight: 700;
      color: var(--df-primary);
      letter-spacing: 0.04em;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-search {
      position: relative;
      display: flex;
      align-items: center;
      width: 320px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: var(--df-text-muted);
      pointer-events: none;
    }

    .header-search-input {
      width: 100%;
      background-color: var(--df-surface-container);
      border: 1px solid var(--df-border-subtle);
      border-radius: var(--df-radius-default);
      padding: 0.55rem 0.85rem 0.55rem 2.25rem;
      color: var(--df-on-surface);
      font-size: 0.825rem;
      font-family: inherit;
      outline: none;
      transition: all var(--df-transition-fast);
    }

    .header-search-input:focus {
      border-color: var(--df-primary);
      box-shadow: 0 0 0 2px rgba(174, 199, 247, 0.2);
      background-color: var(--df-surface-container-high);
      width: 360px;
    }

    .btn-sync {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      gap: 0.45rem;
    }

    .sync-icon.spin {
      animation: spin 1s infinite linear;
    }

    .notifications-wrapper {
      position: relative;
    }

    .notif-btn {
      position: relative;
      color: var(--df-on-surface-variant);
    }
    .notif-btn:hover {
      color: var(--df-text-primary);
    }

    .notif-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--df-error);
      color: var(--df-on-error);
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notif-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 320px;
      padding: 1rem;
      background-color: var(--df-surface-container-high);
      box-shadow: var(--df-shadow-lg);
      border-radius: var(--df-radius-lg);
      z-index: 1000;
    }

    .notif-dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--df-border-subtle);
    }

    .mark-read-btn {
      background: none;
      border: none;
      color: var(--df-primary);
      cursor: pointer;
    }

    .notif-list {
      max-height: 280px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .notif-item {
      padding: 0.5rem 0.65rem;
      border-radius: var(--df-radius-default);
      background-color: var(--df-surface-container);
    }

    .notif-item.unread {
      border-left: 3px solid var(--df-primary);
      background-color: var(--df-surface-container-highest);
    }

    .notif-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.2rem;
    }

    .notif-item-title {
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .notif-time {
      color: var(--df-text-muted);
      font-size: 0.65rem;
    }

    .notif-msg {
      color: var(--df-on-surface-variant);
      line-height: 1.3;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class HeaderComponent {
  readonly supabaseService = inject(SupabaseService);
  readonly notificationService = inject(NotificationService);
  readonly projectService = inject(ProjectService);
  readonly clientService = inject(ClientService);

  readonly isNotifOpen = signal<boolean>(false);

  unreadCount(): number {
    return this.notificationService.history().filter(n => !n.read).length;
  }

  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.projectService.searchQuery.set(val);
    this.clientService.searchQuery.set(val);
  }

  async handleSync() {
    const res = await this.supabaseService.triggerManualSync();
    if (res.success) {
      this.notificationService.success('Sincronización Exitosa', res.message);
    } else {
      this.notificationService.error('Error de Sincronización', res.message);
    }
  }
}
