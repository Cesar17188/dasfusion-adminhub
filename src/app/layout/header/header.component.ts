import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectService } from '../../core/services/project.service';
import { ClientService } from '../../core/services/client.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="df-header">
      <div class="header-left">
        <!-- Mobile Drawer Toggle -->
        <button 
          type="button" 
          class="df-btn-icon df-btn-ghost mobile-menu-toggle" 
          (click)="layoutService.toggleMobileSidebar()"
          title="Abrir Menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="breadcrumb-container">
          <span class="caption breadcrumb-root">DASFUSION</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">ADMIN CRM</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Global Search (Responsive) -->
        <div class="header-search" [class.mobile-search-active]="layoutService.isMobileSearchOpen()">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar proyectos, clientes..." 
            class="header-search-input"
            [value]="projectService.searchQuery()"
            (input)="onSearchChange($event)"
          />
          @if (layoutService.isMobileSearchOpen()) {
            <button type="button" class="close-search-btn" (click)="layoutService.isMobileSearchOpen.set(false)">✕</button>
          }
        </div>

        <!-- Mobile Search Toggle Button -->
        <button 
          type="button" 
          class="df-btn-icon df-btn-ghost mobile-search-trigger"
          (click)="layoutService.toggleMobileSearch()"
          title="Buscar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
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
      height: 64px;
      background-color: rgba(13, 14, 17, 0.95);
      border-bottom: 1px solid var(--df-border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 90;
      backdrop-filter: blur(12px);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .mobile-menu-toggle {
      display: none;
      color: var(--df-text-primary);
      padding: 0.35rem;
      cursor: pointer;
    }

    .breadcrumb-container {
      display: flex;
      align-items: center;
      gap: 0.4rem;
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
      gap: 0.75rem;
    }

    .header-search {
      position: relative;
      display: flex;
      align-items: center;
      width: 280px;
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
      padding: 0.5rem 0.85rem 0.5rem 2.25rem;
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
      width: 320px;
    }

    .mobile-search-trigger {
      display: none;
    }

    .close-search-btn {
      display: none;
    }

    /* Mobile Responsive Breakpoints */
    @media (max-width: 1023px) {
      .df-header {
        padding: 0 1rem;
        height: 58px;
      }

      .mobile-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mobile-search-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header-search {
        display: none;
      }

      .header-search.mobile-search-active {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 58px;
        width: 100vw;
        background-color: var(--df-surface-container-lowest);
        z-index: 100;
        padding: 0 1rem;
        box-shadow: var(--df-shadow-md);
      }

      .header-search.mobile-search-active .header-search-input {
        width: 100% !important;
        font-size: 0.9rem;
      }

      .close-search-btn {
        display: block;
        position: absolute;
        right: 1.5rem;
        background: none;
        border: none;
        color: var(--df-text-muted);
        font-size: 1rem;
        padding: 0.5rem;
        cursor: pointer;
      }
    }

    /* Notifications Dropdown */
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
      width: 300px;
      padding: 1rem;
      background-color: var(--df-surface-container-high);
      box-shadow: var(--df-shadow-lg);
      border-radius: var(--df-radius-lg);
      z-index: 1000;
    }

    @media (max-width: 480px) {
      .notif-dropdown {
        position: fixed;
        left: 1rem;
        right: 1rem;
        width: auto;
        top: 66px;
      }
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
  `]
})
export class HeaderComponent {
  readonly supabaseService = inject(SupabaseService);
  readonly notificationService = inject(NotificationService);
  readonly projectService = inject(ProjectService);
  readonly clientService = inject(ClientService);
  readonly layoutService = inject(LayoutService);

  readonly isNotifOpen = signal<boolean>(false);

  unreadCount(): number {
    return this.notificationService.history().filter(n => !n.read).length;
  }

  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.projectService.searchQuery.set(val);
    this.clientService.searchQuery.set(val);
  }
}
