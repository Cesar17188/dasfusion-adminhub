import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-dialog df-card df-card-glass" [style.max-width]="maxWidth() || '680px'" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-group">
              <h3 class="headline-sm modal-title">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="caption modal-subtitle">{{ subtitle() }}</p>
              }
            </div>
            <button type="button" class="df-btn-icon df-btn-ghost close-btn" (click)="close.emit()" title="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-content custom-scrollbar">
            <ng-content></ng-content>
          </div>

          @if (hasFooter()) {
            <div class="modal-footer">
              <ng-content select="[footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(13, 14, 17, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-dialog {
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background-color: var(--df-surface-container);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(174, 199, 247, 0.15);
      animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 0;
      overflow: hidden;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--df-border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--df-surface-container-low);
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--df-text-primary);
    }

    .modal-subtitle {
      margin-top: 0.2rem;
      color: var(--df-on-surface-variant);
    }

    .close-btn {
      color: var(--df-on-surface-variant);
      border-radius: var(--df-radius-default);
    }
    .close-btn:hover {
      color: var(--df-text-primary);
      background-color: var(--df-surface-container-high);
    }

    .modal-content {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--df-border-subtle);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      background-color: var(--df-surface-container-low);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly maxWidth = input<string>();
  readonly hasFooter = input<boolean>(true);
  readonly close = output<void>();

  onBackdropClick(e: MouseEvent) {
    this.close.emit();
  }
}
