import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toasts.asObservable();
  private idCounter = 0;

  showSuccess(message: string, duration = 3000) {
    this.addToast(message, 'success', duration);
  }

  showError(message: string, duration = 5000) {
    this.addToast(message, 'error', duration);
  }

  showWarning(message: string, duration = 4000) {
    this.addToast(message, 'warning', duration);
  }

  showInfo(message: string, duration = 3000) {
    this.addToast(message, 'info', duration);
  }

  private addToast(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number) {
    const id = `toast-${this.idCounter++}`;
    const toast: ToastMessage = { message, type, duration, id };
    
    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }

  removeToast(id: string) {
    const currentToasts = this.toasts.value;
    this.toasts.next(currentToasts.filter(t => t.id !== id));
  }

  clearAll() {
    this.toasts.next([]);
  }
}
