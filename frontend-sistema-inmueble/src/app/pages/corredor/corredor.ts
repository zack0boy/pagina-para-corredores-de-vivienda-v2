import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PropiedadService } from '../../services/propiedad';
import { SolicitudesClienteService } from '../../services/solicitudes-cliente';
import { EventosCalendarioService } from '../../services/eventos-calendario';
import { PagosService } from '../../services/pagos';

@Component({
  selector: 'app-corredor',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './corredor.html',
  styleUrl: './corredor.css',
})
export class Corredor implements OnInit {
  protected authService = inject(AuthService);
  private propiedadService = inject(PropiedadService);
  private solicitudesService = inject(SolicitudesClienteService);
  private eventosService = inject(EventosCalendarioService);
  private pagosService = inject(PagosService);

  user = signal<any>(this.authService.obtenerUsuarioActual());

  // Métricas del dashboard
  totalPropiedades = signal<number>(0);
  totalSolicitudes = signal<number>(0);
  totalEventos = signal<number>(0);
  totalPagos = signal<number>(0);

  ngOnInit(): void {
    const u = this.user();
    if (!u || u.rol !== 'CORREDOR' || !u.id) return;

    this.propiedadService.findAll({ corredorId: u.id, limit: 1 }).subscribe({
      next: (res) => this.totalPropiedades.set(res?.total ?? 0),
      error: () => {},
    });

    this.solicitudesService.findAll().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        this.totalSolicitudes.set(
          lista.filter((s: any) => (s.estado || '').toUpperCase() === 'PENDIENTE').length,
        );
      },
      error: () => {},
    });

    this.eventosService.findByCorredor(u.id).subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        this.totalEventos.set(lista.filter((e: any) => !e.completado).length);
      },
      error: () => {},
    });

    this.pagosService.findByCorredor(u.id).subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        this.totalPagos.set(lista.length);
      },
      error: () => {},
    });
  }
}
