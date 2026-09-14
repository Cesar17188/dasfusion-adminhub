import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<AppNotification[]>([]);
  readonly history = signal<AppNotification[]>([
    {
      id: 'notif-1',
      type: 'info',
      title: 'Propuesta DASFusion-hub',
      message: 'Nueva propuesta recibida de Sophia Chang (AeroDynamics Global).',
      timestamp: new Date(Date.now() - 3600000 * 2),
      read: false
    },
    {
      id: 'notif-2',
      type: 'warning',
      title: 'Próxima Entrega',
      message: 'VanguardRisk tiene fecha de release programada en 15 días.',
      timestamp: new Date(Date.now() - 3600000 * 5),
      read: true
    }
  ]);

  show(type: AppNotification['type'], title: string, message: string, durationMs = 4000) {
    const notif: AppNotification = {
      id: 'toast-' + Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };

    this.toasts.update(current => [notif, ...current]);
    this.history.update(current => [notif, ...current]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(notif.id);
      }, durationMs);
    }
  }

  success(title: string, message: string) {
    this.show('success', title, message);
  }

  error(title: string, message: string) {
    this.show('error', title, message, 6000);
  }

  warning(title: string, message: string) {
    this.show('warning', title, message, 5000);
  }

  info(title: string, message: string) {
    this.show('info', title, message);
  }

  dismiss(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  markAllAsRead() {
    this.history.update(current => current.map(n => ({ ...n, read: true })));
  }

  clearAllToasts() {
    this.toasts.set([]);
  }
}
