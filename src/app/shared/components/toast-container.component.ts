import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-card df-card" [ngClass]="'toast-' + toast.type">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
              @case ('error') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
              @case ('warning') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              }
              @default {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
            }
          </div>
          <div class="toast-body">
            <h5 class="toast-title">{{ toast.title }}</h5>
            <p class="toast-message caption">{{ toast.message }}</p>
          </div>
          <button type="button" class="toast-close" (click)="notificationService.dismiss(toast.id)">
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1100;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: 100%;
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.25rem;
      background: rgba(30, 32, 34, 0.92);
      backdrop-filter: blur(12px);
      border-radius: var(--df-radius-lg);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .toast-success {
      border-left: 4px solid var(--df-success);
      .toast-icon { color: var(--df-success); }
    }
    .toast-error {
      border-left: 4px solid var(--df-error);
      .toast-icon { color: var(--df-error); }
    }
    .toast-warning {
      border-left: 4px solid var(--df-tertiary);
      .toast-icon { color: var(--df-tertiary); }
    }
    .toast-info {
      border-left: 4px solid var(--df-primary);
      .toast-icon { color: var(--df-primary); }
    }

    .toast-body {
      flex: 1;
    }

    .toast-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--df-text-primary);
      margin-bottom: 0.2rem;
    }

    .toast-message {
      color: var(--df-on-surface-variant);
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--df-text-muted);
      font-size: 1.25rem;
      cursor: pointer;
      line-height: 1;
    }
    .toast-close:hover {
      color: var(--df-text-primary);
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);
}
