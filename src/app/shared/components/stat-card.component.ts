import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="df-card stat-card" [ngClass]="'variant-' + (variant() || 'default')">
      <div class="stat-header">
        <span class="label-md stat-label">{{ label() }}</span>
        @if (badge()) {
          <span class="df-pill" [ngClass]="badgeClass()">{{ badge() }}</span>
        }
      </div>

      <div class="stat-body">
        <div class="stat-value display-lg-mobile">{{ value() || '0' }}</div>
        @if (icon()) {
          <div class="stat-icon-wrapper">
            <span class="stat-icon-raw" [innerHTML]="icon()"></span>
          </div>
        }
      </div>

      @if (description() || trend()) {
        <div class="stat-footer">
          @if (trend()) {
            <span class="trend-badge" [ngClass]="isTrendPositive() ? 'trend-up' : 'trend-down'">
              {{ isTrendPositive() ? '↑' : '↓' }} {{ trend() }}
            </span>
          }
          @if (description()) {
            <span class="caption stat-desc">{{ description() }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1.35rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      position: relative;
      background: linear-gradient(180deg, var(--df-surface-container) 0%, var(--df-surface-container-low) 100%);
    }

    .stat-card.variant-primary {
      border-color: rgba(174, 199, 247, 0.25);
      box-shadow: 0 4px 20px rgba(27, 54, 93, 0.3);
    }
    .stat-card.variant-tertiary {
      border-color: rgba(241, 189, 129, 0.25);
    }
    .stat-card.variant-success {
      border-color: rgba(107, 227, 161, 0.25);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-label {
      color: var(--df-on-surface-variant);
      font-size: 0.75rem;
    }

    .stat-body {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .stat-value {
      font-weight: 700;
      color: var(--df-text-primary);
      letter-spacing: -0.02em;
    }

    .stat-icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: var(--df-radius-default);
      background-color: var(--df-surface-container-high);
      border: 1px solid var(--df-border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--df-primary);
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .trend-badge {
      font-weight: 600;
      font-size: 0.75rem;
      padding: 0.15rem 0.45rem;
      border-radius: var(--df-radius-sm);
    }

    .trend-up {
      background-color: rgba(107, 227, 161, 0.15);
      color: var(--df-success);
    }

    .trend-down {
      background-color: rgba(255, 180, 171, 0.15);
      color: var(--df-error);
    }

    .stat-desc {
      color: var(--df-text-muted);
    }
  `]
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>('0');
  readonly badge = input<string>();
  readonly badgeType = input<'primary' | 'success' | 'warning' | 'error' | 'neutral'>('primary');
  readonly description = input<string>();
  readonly trend = input<string>();
  readonly isTrendPositive = input<boolean>(true);
  readonly icon = input<string>();
  readonly variant = input<'primary' | 'tertiary' | 'success' | 'warning' | 'error' | 'default'>('default');

  badgeClass(): string {
    const type = this.badgeType();
    return `df-pill-${type}`;
  }
}
