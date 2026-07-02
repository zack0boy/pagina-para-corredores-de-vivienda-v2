import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudesClienteService } from '../../../services/solicitudes-cliente';

@Component({
  selector: 'app-corredor-solicitudes',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class SolicitudesCorredor implements OnInit {
  private service = inject(SolicitudesClienteService);

  solicitudes = signal<any[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  toast = signal<string>('');

  // Solo las pendientes
  pendientes = computed(() =>
    this.solicitudes().filter((s) => (s.estado || '').toUpperCase() === 'PENDIENTE'),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.findAll().subscribe({
      next: (data) => {
        this.solicitudes.set(Array.isArray(data) ? data : data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes.');
        this.cargando.set(false);
      },
    });
  }

  aprobar(id: string): void {
    this.service.resolver(id, { estado: 'APROBADA' }).subscribe({
      next: () => {
        this.solicitudes.update((l) => l.filter((s) => s.id !== id));
        this.mostrarToast('Cliente aprobado');
      },
      error: () => this.error.set('No se pudo aprobar la solicitud.'),
    });
  }

  rechazar(id: string): void {
    const motivo = prompt('Motivo del rechazo (opcional):') ?? '';
    this.service.resolver(id, { estado: 'RECHAZADA', motivo_rechazo: motivo }).subscribe({
      next: () => {
        this.solicitudes.update((l) => l.filter((s) => s.id !== id));
        this.mostrarToast('Solicitud rechazada');
      },
      error: () => this.error.set('No se pudo rechazar la solicitud.'),
    });
  }

  tiempoRestante(fechaExp: string): string {
    if (!fechaExp) return '';
    const diff = new Date(fechaExp).getTime() - Date.now();
    if (diff <= 0) return 'Expirada';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m restantes`;
  }

  iniciales(s: any): string {
    const base = (s.nombre || s.cliente_id || 'CL').toString();
    return base.slice(0, 2).toUpperCase();
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
