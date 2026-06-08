import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
  selector: 'app-notificacion-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-bell.component.html',
  styleUrls: ['./notificacion-bell.component.css']
})
export class NotificacionBellComponent implements OnInit {
  @Input() userId: string = '';
  @Output() notificationClick = new EventEmitter<any>();

  isOpen = false;
  notificaciones: any[] = [];
  unreadCount = 0;

  constructor(private notificacionesService: NotificacionesService) {}

  ngOnInit() {
    this.loadNotificaciones();
    // Refresh cada 30 segundos
    setInterval(() => this.loadNotificaciones(), 30000);
  }

  loadNotificaciones() {
    if (this.userId) {
      this.notificacionesService.getByUser(this.userId).subscribe(
        (data: any) => {
          this.notificaciones = data.slice(0, 5); // Últimas 5
          this.unreadCount = data.filter((n: any) => !n.leida).length;
        }
      );
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  markAsRead(notificacion: any) {
    if (notificacion.id) {
      this.notificacionesService.markAsRead(notificacion.id).subscribe(
        () => {
          notificacion.leida = true;
          this.loadNotificaciones();
        }
      );
    }
    this.notificationClick.emit(notificacion);
  }

  getIcon(tipo: string): string {
    switch (tipo) {
      case 'lead': return '👤';
      case 'visita': return '📅';
      case 'contrato': return '📄';
      case 'pago': return '💰';
      default: return 'ℹ️';
    }
  }
}
