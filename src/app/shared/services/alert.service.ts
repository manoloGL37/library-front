import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'info';

export interface Alert {
  id: number;
  message: string;
  type: AlertType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private nextId = 1;
  alerts = signal<Alert[]>([]); // Array de alertas

  // Añadir alerta
  add(message: string, type: AlertType = 'info', duration: number = 3000) {
    const id = this.nextId++;
    const newAlert: Alert = { id, message, type, duration };

    // Usando update en lugar de mutate
    this.alerts.update(current => [...current, newAlert]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  // Quitar alerta por id
  remove(id: number) {
    this.alerts.update(current => current.filter(alert => alert.id !== id));
  }

  success(msg: string, duration?: number) {
    this.add(msg, 'success', duration);
  }

  error(msg: string, duration?: number) {
    this.add(msg, 'error', duration);
  }

  info(msg: string, duration?: number) {
    this.add(msg, 'info', duration);
  }
}
