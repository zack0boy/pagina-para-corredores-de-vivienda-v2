import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/toast/toast.component';
import { ToastService, ToastMessage } from './services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="toast-container">
      <app-toast 
        *ngFor="let toast of toasts$ | async"
        [message]="toast.message"
        [type]="toast.type"
        [duration]="toast.duration">
      </app-toast>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    }
  `]
})
export class ToastContainerComponent {
  get toasts$() {
    return this.toastService.toasts$;
  }

  constructor(private toastService: ToastService) {}
}
