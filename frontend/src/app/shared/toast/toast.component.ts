import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() duration = 3000;
  
  isVisible = true;
  private timeout: any;

  ngOnInit() {
    this.timeout = setTimeout(() => {
      this.isVisible = false;
    }, this.duration);
  }

  ngOnDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  getIcon(): string {
    switch (this.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  }

  close() {
    this.isVisible = false;
  }
}
