import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastContainerComponent } from '../../shared/components/toast-container.component';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule,
    SidebarComponent, 
    HeaderComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="app-layout-shell">
      <!-- Mobile Backdrop Overlay -->
      @if (layoutService.isMobileSidebarOpen()) {
        <div class="sidebar-backdrop" (click)="layoutService.closeMobileSidebar()"></div>
      }

      <!-- Sidebar (Desktop Fixed / Mobile Off-Canvas Drawer) -->
      <app-sidebar [class.mobile-open]="layoutService.isMobileSidebarOpen()"></app-sidebar>

      <div class="app-main-viewport">
        <app-header></app-header>
        <main class="app-content-container">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Bottom Navigation Bar (Thumb-friendly UX) -->
      <nav class="mobile-bottom-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Inicio</span>
        </a>

        <a routerLink="/kanban" routerLinkActive="active" class="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="3" x2="18" y2="21"></line>
            <line x1="6" y1="3" x2="6" y2="21"></line>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
          <span>Kanban</span>
        </a>

        <a routerLink="/clients" routerLinkActive="active" class="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          </svg>
          <span>Clientes</span>
        </a>

        <a routerLink="/users" routerLinkActive="active" class="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          </svg>
          <span>Admins</span>
        </a>

        <button type="button" class="bottom-nav-item menu-btn" (click)="layoutService.toggleMobileSidebar()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span>Menú</span>
        </button>
      </nav>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-layout-shell {
      display: flex;
      width: 100vw;
      min-height: 100vh;
      background-color: var(--df-background);
      position: relative;
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 1023px) {
      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        z-index: 990;
        animation: fadeIn 0.25s ease;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .app-main-viewport {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    .app-content-container {
      flex: 1;
      padding: 1.5rem;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }

    /* Mobile Bottom Navigation Bar */
    .mobile-bottom-nav {
      display: none;
    }

    @media (max-width: 1023px) {
      .app-content-container {
        padding: 1rem 0.85rem;
        padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
      }

      .mobile-bottom-nav {
        display: flex;
        align-items: center;
        justify-content: space-around;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(13, 14, 17, 0.95);
        border-top: 1px solid var(--df-border-subtle);
        backdrop-filter: blur(16px);
        z-index: 900;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
      }

      .bottom-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        color: var(--df-text-muted);
        text-decoration: none;
        background: none;
        border: none;
        font-size: 0.65rem;
        font-weight: 600;
        padding: 0.35rem 0.65rem;
        border-radius: var(--df-radius-sm);
        transition: all var(--df-transition-fast);
        min-width: 54px;
        cursor: pointer;
      }

      .bottom-nav-item svg {
        opacity: 0.8;
      }

      .bottom-nav-item.active {
        color: var(--df-primary);
      }

      .bottom-nav-item.active svg {
        stroke: var(--df-primary);
        opacity: 1;
      }

      .bottom-nav-item:active {
        transform: scale(0.92);
      }
    }
  `]
})
export class MainLayoutComponent {
  readonly layoutService = inject(LayoutService);
}
