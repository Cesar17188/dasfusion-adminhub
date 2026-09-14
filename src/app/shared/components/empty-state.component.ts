import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-container df-card">
      <div class="empty-icon-box">
        @if (icon()) {
          <span [innerHTML]="icon()"></span>
        } @else {
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        }
      </div>
      <h4 class="headline-sm empty-title">{{ title() }}</h4>
      <p class="body-md empty-description">{{ description() }}</p>
      @if (actionLabel()) {
        <button type="button" class="df-btn df-btn-primary action-btn" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 2rem;
      border: 1px dashed var(--df-border-medium);
      background-color: rgba(26, 27, 30, 0.4);
      margin: 1.5rem 0;
    }

    .empty-icon-box {
      width: 64px;
      height: 64px;
      border-radius: var(--df-radius-xl);
      background-color: var(--df-surface-container-high);
      border: 1px solid var(--df-border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--df-primary);
      margin-bottom: 1.25rem;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--df-text-primary);
      margin-bottom: 0.5rem;
    }

    .empty-description {
      color: var(--df-text-secondary);
      max-width: 480px;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .action-btn {
      padding: 0.6rem 1.5rem;
    }
  `]
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<string>();
  readonly actionLabel = input<string>();
  readonly action = output<void>();
}
