import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { NotificacionesService } from '../../services/notificaciones';
import { AuthService } from '../../services/auth';

const RUTA_TIPO: Record<string, string> = {
  LEAD: '/corredor/solicitudes',
  VISITA: '/corredor/calendario',
  PAGO: '/corredor/pagos',
  CONTRATO: '/corredor/contratos',
  SOLICITUD: '/corredor/solicitudes',
  SISTEMA: '',
};

@Component({
  selector: 'app-notificaciones-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notificaciones-bell.html',
  styleUrl: './notificaciones-bell.css',
})
export class NotificacionesBell implements OnInit, OnDestroy {
  private service = inject(NotificacionesService);
  private authService = inject(AuthService);
  private sub?: Subscription;

  abierto = signal<boolean>(false);
  notificaciones = signal<any[]>([]);
  noLeidasCount = signal<number>(0);

  ngOnInit(): void {
    if (!this.authService.estaLogueado()) return;
    // Poll cada 30s por nuevas notificaciones (no hay websockets en el backend).
    this.sub = interval(30000)
      .pipe(startWith(0), switchMap(() => this.service.noLeidas()))
      .subscribe({
        next: (lista) => this.noLeidasCount.set(Array.isArray(lista) ? lista.length : 0),
        error: () => {},
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggle(): void {
    this.abierto.update((v) => !v);
    if (this.abierto()) {
      this.service.misNotificaciones().subscribe({
        next: (lista) => this.notificaciones.set(Array.isArray(lista) ? lista.slice(0, 20) : []),
        error: () => {},
      });
    }
  }

  marcarLeida(notif: any): void {
    if (notif.leida) return;
    this.service.marcarLeida(notif.id).subscribe({
      next: () => {
        notif.leida = true;
        this.noLeidasCount.update((n) => Math.max(0, n - 1));
      },
    });
  }

  rutaDe(notif: any): string {
    return RUTA_TIPO[notif.tipo] || '';
  }
}
