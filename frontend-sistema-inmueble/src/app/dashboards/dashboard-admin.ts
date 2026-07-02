import { Component, OnInit, inject, signal } from '@angular/core';
import { Navbar } from "../components/navbar/navbar";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { DashboardService } from '../services/dashboard';
import { PropiedadService } from '../services/propiedad';
import { PagosService } from '../services/pagos';
import { SolicitudesClienteService } from '../services/solicitudes-cliente';
import { EventosCalendarioService } from '../services/eventos-calendario';
import { SolicitudesPropiedadService } from '../services/solicitudes-propiedad';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css'],
})
export class DashboardAdmin implements OnInit {
  protected authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private propiedadService = inject(PropiedadService);
  private pagosService = inject(PagosService);
  private solicitudesService = inject(SolicitudesClienteService);
  private eventosService = inject(EventosCalendarioService);
  private solicitudesPropiedadService = inject(SolicitudesPropiedadService);

  dashboard = signal<any>(null);
  cargando = signal<boolean>(true);
  propiedades = signal<any[]>([]);
  usuario = signal<any>(null);
  pagos = signal<any[]>([]);
  pagosTotal = signal<number>(0);
  pagosCobrado = signal<number>(0);
  pagosPendiente = signal<number>(0);
  pagosCobradoPct = signal<number>(0);
  pagosPendientePct = signal<number>(0);

  user = signal<any>(this.authService.obtenerUsuarioActual());

  // Métricas del dashboard
  totalPropiedades = signal<number>(0);
  totalSolicitudes = signal<number>(0);
  totalEventos = signal<number>(0);
  totalPagos = signal<number>(0);

  ngOnInit(): void {
    this.cargando.set(true);
    const user = this.authService.obtenerUsuarioActual();
    this.user.set(user);

    if (!user) {
      this.cargando.set(false);
      return;
    }

    this.usuario.set(user);

    // Cargar propiedades (todas para admin, solo del corredor para corredores)
    const propiedadParams = user.rol === 'CORREDOR' 
      ? { corredorId: user.id, limit: 1 }
      : { page: 1, limit: 1 };
      
    this.propiedadService.findAll(propiedadParams).subscribe({
      next: (res) => {
        console.log('📊 Propiedades cargadas:', res?.total ?? 0);
        this.totalPropiedades.set(res?.total ?? 0);
      },
      error: (e) => {
        console.error('❌ Error cargando propiedades:', e);
        this.totalPropiedades.set(0);
      },
    });

    // Cargar solicitudes pendientes
    this.solicitudesPropiedadService.pendientes().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        console.log('📝 Solicitudes pendientes:', lista.length);
        this.totalSolicitudes.set(lista.length);
      },
      error: (e) => {
        console.error('❌ Error cargando solicitudes:', e);
        this.totalSolicitudes.set(0);
      },
    });

    // Cargar eventos (si es corredor)
    if (user.rol === 'CORREDOR' && user.id) {
      this.eventosService.findByCorredor(user.id).subscribe({
        next: (data) => {
          const lista = Array.isArray(data) ? data : data?.data ?? [];
          console.log('📅 Eventos próximos:', lista.filter((e: any) => !e.completado).length);
          this.totalEventos.set(lista.filter((e: any) => !e.completado).length);
        },
        error: (e) => {
          console.error('❌ Error cargando eventos:', e);
          this.totalEventos.set(0);
        },
      });

      // Pagos del corredor
      this.pagosService.findByCorredor(user.id).subscribe({
        next: (data) => {
          const lista = Array.isArray(data) ? data : data?.data ?? [];
          console.log('💰 Pagos registrados:', lista.length);
          this.totalPagos.set(lista.length);
        },
        error: (e) => {
          console.error('❌ Error cargando pagos:', e);
          this.totalPagos.set(0);
        },
      });
    } else {
      // Para admin: cargar todos los pagos
      this.pagosService.findAll().subscribe({
        next: (list: any[]) => {
          console.log('💰 Total de pagos:', list?.length ?? 0);
          this.totalPagos.set(list?.length ?? 0);
        },
        error: (e) => {
          console.error('❌ Error cargando pagos:', e);
          this.totalPagos.set(0);
        },
      });
    }

    // Cargar propiedades completo para tabla
    this.propiedadService.findAll({ page: 1, limit: 10 }).subscribe({ 
      next: (res) => {
        const data = res.data ? res.data : res;
        this.propiedades.set(data || []);
      }, 
      error: (e) => console.error('Error cargando propiedades', e) 
    });

    const rol = (user.rol || user.rolUsuario || user.role)?.toString().toUpperCase() || '';

    if (rol === 'SUPER_ADMIN') {
      this.dashboardService.superAdmin().subscribe({ 
        next: (d) => { 
          this.dashboard.set(d); 
          this.cargando.set(false); 
        }, 
        error: (e: unknown) => { 
          console.error('❌ Error super admin:', e); 
          this.cargando.set(false); 
        } 
      });
      return;
    }

    // ADMIN_EMPRESA
    const empresaId = user.empresa_id || user.empresaId || (user.empresa && user.empresa.id);
    this.dashboardService.adminEmpresa(empresaId).subscribe({ 
      next: (d) => { 
        this.dashboard.set(d); 
        this.cargando.set(false); 
      }, 
      error: (e: unknown) => { 
        console.error('❌ Error admin empresa:', e); 
        this.cargando.set(false); 
      } 
    });

    // Cargar pagos y calcular total del mes
    this.pagosService.findAll().subscribe({ 
      next: (list: any[]) => {
        this.pagos.set(list || []);
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const pagosMes = (list || []).filter((p: any) => {
          if (!p || !p.fecha_pago) return false;
          const d = new Date(p.fecha_pago);
          return d.getMonth() === month && d.getFullYear() === year;
        });

        const suma = pagosMes.reduce((s: number, p: any) => s + (Number(p.monto) || 0), 0);
        this.pagosTotal.set(suma);

        const cobrado = (pagosMes || []).filter((p: any) => p.estado === 'VALIDADO').reduce((s: number, p: any) => s + (Number(p.monto) || 0), 0);
        const pendiente = (pagosMes || []).filter((p: any) => p.estado === 'PENDIENTE_VALIDACION').reduce((s: number, p: any) => s + (Number(p.monto) || 0), 0);

        this.pagosCobrado.set(cobrado);
        this.pagosPendiente.set(pendiente);

        const totalForPct = (cobrado + pendiente) || suma || 1;
        const pctCobrado = totalForPct ? (cobrado / totalForPct) * 100 : 0;
        const pctPendiente = totalForPct ? (pendiente / totalForPct) * 100 : 0;
        this.pagosCobradoPct.set(Number(pctCobrado.toFixed(1)));
        this.pagosPendientePct.set(Number(pctPendiente.toFixed(1)));
      }, 
      error: (e) => { 
        console.error('Error cargando pagos', e); 
      } 
    });
  }
}
