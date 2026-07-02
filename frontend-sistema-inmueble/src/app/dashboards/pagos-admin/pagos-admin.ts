import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { AuthService } from '../../services/auth';
import { PagosService } from '../../services/pagos';

@Component({
  selector: 'app-pagos-admin',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './pagos-admin.html',
  styleUrls: ['../dashboard-admin.css', './pagos-admin.css'],
})
export class PagosAdmin implements OnInit {
  protected authService = inject(AuthService);
  private pagosService = inject(PagosService);

  user = signal<any>(this.authService.obtenerUsuarioActual());
  pagos = signal<any[]>([]);
  cargando = signal<boolean>(true);
  procesando = signal<string>(''); // id del pago en proceso
  filtro = signal<'TODOS' | 'PENDIENTE_VALIDACION' | 'VALIDADO' | 'RECHAZADO'>('TODOS');

  pagosFiltrados = computed(() => {
    const f = this.filtro();
    if (f === 'TODOS') return this.pagos();
    return this.pagos().filter((p) => p.estado === f);
  });

  pendientesCount = computed(() =>
    this.pagos().filter((p) => p.estado === 'PENDIENTE_VALIDACION').length,
  );

  esAdmin(): boolean {
    const rol = (this.user()?.rol || this.user()?.rolUsuario || this.user()?.role || '').toString().toUpperCase();
    return ['SUPER_ADMIN', 'ADMIN_EMPRESA'].includes(rol);
  }

  esSuperAdmin(): boolean {
    return (this.user()?.rol || this.user()?.rolUsuario || this.user()?.role || '').toString().toUpperCase() === 'SUPER_ADMIN';
  }

  ngOnInit(): void {
    if (!this.esAdmin()) {
      this.cargando.set(false);
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.pagosService.findAll().subscribe({
      next: (lista) => {
        this.pagos.set(Array.isArray(lista) ? lista : (lista as any)?.data ?? []);
        this.cargando.set(false);
      },
      error: (e) => {
        console.error('Error cargando pagos', e);
        this.cargando.set(false);
      },
    });
  }

  private resolver(pago: any, estado: 'VALIDADO' | 'RECHAZADO'): void {
    const accion = estado === 'VALIDADO' ? 'validar' : 'rechazar';
    const comentario = estado === 'RECHAZADO'
      ? (prompt(`Motivo del rechazo del pago de ${pago.cliente_nombre || 'cliente'}:`) ?? undefined)
      : undefined;

    if (estado === 'RECHAZADO' && comentario === undefined) return; // canceló el prompt

    if (estado === 'VALIDADO' && !confirm(`¿Validar el pago de $${Number(pago.monto).toLocaleString('es-CL')} de ${pago.cliente_nombre || 'cliente'}?`)) {
      return;
    }

    this.procesando.set(pago.id);
    this.pagosService.validar(pago.id, {
      estado,
      validado_por: this.user()?.id,
      comentario,
    }).subscribe({
      next: () => {
        this.procesando.set('');
        this.cargar();
      },
      error: (e) => {
        this.procesando.set('');
        alert(`❌ Error al ${accion} el pago: ` + (e.error?.message || e.statusText));
      },
    });
  }

  validarPago(pago: any): void {
    this.resolver(pago, 'VALIDADO');
  }

  rechazarPago(pago: any): void {
    this.resolver(pago, 'RECHAZADO');
  }
}
