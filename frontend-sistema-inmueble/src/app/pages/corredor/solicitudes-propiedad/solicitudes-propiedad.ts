import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SolicitudesPropiedadService } from '../../../services/solicitudes-propiedad';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-corredor-solicitudes-propiedad',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './solicitudes-propiedad.html',
  styleUrl: './solicitudes-propiedad.css',
})
export class SolicitudesPropiedadCorredor implements OnInit {
  private service = inject(SolicitudesPropiedadService);
  private authService = inject(AuthService);

  solicitudes = signal<any[]>([]);
  cargando = signal(true);
  error = signal('');
  toast = signal('');

  user = this.authService.obtenerUsuarioActual();

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.service.pendientes().subscribe({
      next: (d) => { this.solicitudes.set(Array.isArray(d) ? d : d?.data ?? []); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar las solicitudes.'); this.cargando.set(false); },
    });
  }

  aprobar(id: string): void {
    if (!confirm('¿Aprobar y publicar esta propiedad? Quedarás como representante.')) return;
    this.service.resolver(id, { estado: 'APROBADA', corredor_id: this.user?.id }).subscribe({
      next: () => { this.solicitudes.update(l => l.filter(s => s.id !== id)); this.mostrarToast('Propiedad publicada (eres el representante)'); },
      error: (e) => this.error.set(e.error?.message ?? 'No se pudo aprobar.'),
    });
  }

  rechazar(id: string): void {
    const motivo = prompt('Motivo del rechazo (opcional):') ?? '';
    this.service.resolver(id, { estado: 'RECHAZADA', corredor_id: this.user?.id, motivo_rechazo: motivo }).subscribe({
      next: () => { this.solicitudes.update(l => l.filter(s => s.id !== id)); this.mostrarToast('Solicitud rechazada'); },
      error: () => this.error.set('No se pudo rechazar.'),
    });
  }

  formatPrecio(v: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(v || 0);
  }

  private mostrarToast(m: string): void { this.toast.set(m); setTimeout(() => this.toast.set(''), 3000); }
}
