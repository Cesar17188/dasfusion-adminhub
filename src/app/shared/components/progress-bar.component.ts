import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      @if (showLabel()) {
        <div class="progress-labels">
          <span class="caption progress-name">{{ label() }}</span>
          <span class="caption progress-value">{{ percentage() }}%</span>
        </div>
      }
      <div class="progress-track" [style.height]="height() || '8px'">
        <div 
          class="progress-fill" 
          [ngClass]="fillClass()"
          [style.width.%]="percentage()"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .progress-labels {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .progress-name {
      color: var(--df-on-surface-variant);
      font-weight: 500;
    }

    .progress-value {
      font-weight: 600;
      color: var(--df-text-primary);
    }

    .progress-track {
      width: 100%;
      background-color: var(--df-surface-container-highest);
      border-radius: var(--df-radius-full);
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--df-radius-full);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(90deg, var(--df-primary-container) 0%, var(--df-primary) 100%);
    }

    .fill-primary {
      background: linear-gradient(90deg, #1b365d 0%, #aec7f7 100%);
    }

    .fill-success {
      background: linear-gradient(90deg, #00522a 0%, #6be3a1 100%);
    }

    .fill-tertiary {
      background: linear-gradient(90deg, #623f0f 0%, #f1bd81 100%);
    }

    .fill-error {
      background: linear-gradient(90deg, #93000a 0%, #ffb4ab 100%);
    }
  `]
})
export class ProgressBarComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  readonly label = input<string>('Progreso');
  readonly showLabel = input<boolean>(true);
  readonly height = input<string>('8px');
  readonly variant = input<'primary' | 'success' | 'tertiary' | 'error' | 'auto'>('auto');

  readonly percentage = computed(() => {
    const v = Number(this.value()) || 0;
    const m = Number(this.max()) || 100;
    const calc = Math.round((v / m) * 100);
    return Math.min(Math.max(calc, 0), 100);
  });

  readonly fillClass = computed(() => {
    const varChoice = this.variant();
    if (varChoice !== 'auto') {
      return `fill-${varChoice}`;
    }
    const pct = this.percentage();
    if (pct >= 100) return 'fill-success';
    if (pct >= 50) return 'fill-primary';
    if (pct >= 25) return 'fill-tertiary';
    return 'fill-primary';
  });
}
