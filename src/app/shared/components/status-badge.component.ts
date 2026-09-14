import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="df-pill" [ngClass]="badgeClass()">
      <span class="indicator-dot"></span>
      {{ label() }}
    </span>
  `,
  styles: [`
    .indicator-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }
  `]
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly customLabel = input<string>();

  readonly label = computed(() => {
    if (this.customLabel()) return this.customLabel()!;
    const s = this.status();
    switch (s) {
      // Client statuses
      case 'lead': return 'Lead Hub';
      case 'contacted': return 'Contactado';
      case 'negotiation': return 'En Negociación';
      case 'active': return 'Cliente Activo';
      case 'completed': return 'Completado';
      case 'on_hold': return 'En Pausa';
      
      // Project statuses
      case 'architecture': return 'Arquitectura';
      case 'development': return 'En Desarrollo';
      case 'testing': return 'En Pruebas QA';
      case 'delivery': return 'Listo p/ Entrega';
      
      // QA & Bug statuses
      case 'passed': return 'Aprobado';
      case 'failed': return 'Fallido';
      case 'blocked': return 'Bloqueado';
      case 'untested': return 'Sin Probar';
      case 'open': return 'Abierto';
      case 'investigating': return 'Investigando';
      case 'fixing': return 'En Corrección';
      case 'in_retest': return 'En Re-test';
      case 'resolved': return 'Resuelto';
      case 'closed': return 'Cerrado';
      
      // Priorities
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';

      // Delivery statuses
      case 'upcoming': return 'Próximo';
      case 'on_track': return 'En Tiempo';
      case 'at_risk': return 'En Riesgo';
      case 'delayed': return 'Retrasado';
      case 'delivered': return 'Entregado';
      case 'accepted': return 'Aceptado por Cliente';

      default: return s;
    }
  });

  readonly badgeClass = computed(() => {
    const s = this.status();
    switch (s) {
      case 'completed':
      case 'active':
      case 'passed':
      case 'resolved':
      case 'closed':
      case 'on_track':
      case 'delivered':
      case 'accepted':
        return 'df-pill-success';

      case 'development':
      case 'architecture':
      case 'testing':
      case 'lead':
      case 'contacted':
      case 'in_retest':
      case 'fixing':
      case 'medium':
        return 'df-pill-primary';

      case 'negotiation':
      case 'upcoming':
      case 'investigating':
      case 'at_risk':
      case 'high':
      case 'untested':
        return 'df-pill-warning';

      case 'failed':
      case 'critical':
      case 'blocked':
      case 'delayed':
      case 'open':
        return 'df-pill-error';

      default:
        return 'df-pill-neutral';
    }
  });
}
