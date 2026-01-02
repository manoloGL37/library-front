import { Component } from '@angular/core';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class Alert {
  constructor(private alertService: AlertService) {}

  get alerts() {
    return this.alertService.alerts;
  }

  remove(id: number) {
    this.alertService.remove(id);
  }

  getClass(type: 'success' | 'error' | 'info') {
    switch (type) {
      case 'success':
        return 'bg-green-700 text-white';
      case 'error':
        return 'bg-red-700 text-white';
      case 'info':
        return 'bg-blue-700 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  }
}
