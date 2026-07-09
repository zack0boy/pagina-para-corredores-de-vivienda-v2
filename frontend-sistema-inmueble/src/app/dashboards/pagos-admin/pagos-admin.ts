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
  filtroTipoPago = signal<'TODOS' | 'TRANSFERENCIA' | 'PRESENCIAL'>('TODOS');
  filtroTexto = signal<string>('');
  filtroDesde = signal<string>('');
  filtroHasta = signal<string>('');

  // Resumen por empresa (SUPER_ADMIN, separadas entre sí) o por corredor dentro de la empresa (ADMIN_EMPRESA)
  resumenesPorEmpresa = signal<any[]>([]);
  resumenEmpresaPropia = signal<any | null>(null);

  comprobantesAbiertos = signal<string>(''); // id del pago cuyos comprobantes se muestran
  comprobantes = signal<any[]>([]);

  pagosFiltrados = computed(() => {
    let lista = this.pagos();
    const f = this.filtro();
    if (f !== 'TODOS') lista = lista.filter((p) => p.estado === f);

    const tipo = this.filtroTipoPago();
    if (tipo !== 'TODOS') lista = lista.filter((p) => p.tipo_pago === tipo);

    const texto = this.filtroTexto().trim().toLowerCase();
    if (texto) {
      lista = lista.filter((p) =>
        (p.cliente_nombre || '').toLowerCase().includes(texto) ||
        (p.propiedad_titulo || '').toLowerCase().includes(texto),
      );
    }

    const desde = this.filtroDesde();
    if (desde) lista = lista.filter((p) => new Date(p.fecha_pago) >= new Date(desde));

    const hasta = this.filtroHasta();
    if (hasta) lista = lista.filter((p) => new Date(p.fecha_pago) <= new Date(hasta + 'T23:59:59'));

    return lista;
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
    this.cargarResumenes();
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

  // SUPER_ADMIN: una tabla por empresa, NUNCA sumadas entre sí.
  // ADMIN_EMPRESA: una tabla con el desglose por corredor de su propia empresa.
  cargarResumenes(): void {
    if (this.esSuperAdmin()) {
      this.pagosService.resumenTodasEmpresas().subscribe({
        next: (res) => this.resumenesPorEmpresa.set(res ?? []),
        error: () => {},
      });
    } else {
      const empresaId = this.user()?.empresa_id;
      if (!empresaId) return;
      this.pagosService.resumenEmpresa(empresaId).subscribe({
        next: (res) => this.resumenEmpresaPropia.set(res),
        error: () => {},
      });
    }
  }

  verComprobantes(pago: any): void {
    if (this.comprobantesAbiertos() === pago.id) {
      this.comprobantesAbiertos.set('');
      return;
    }
    this.comprobantesAbiertos.set(pago.id);
    this.pagosService.comprobantesPorPago(pago.id).subscribe({
      next: (res) => this.comprobantes.set(Array.isArray(res) ? res : []),
      error: () => this.comprobantes.set([]),
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
        this.cargarResumenes();
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

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor || 0);
  }
}
