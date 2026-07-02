import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { AuthService } from '../../services/auth';
import { ReportesService, ResumenReporte } from '../../services/reportes';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './reportes.html',
  styleUrls: ['../dashboard-admin.css', './reportes.css'],
})
export class Reportes implements OnInit {
  protected authService = inject(AuthService);
  private reportesService = inject(ReportesService);

  user = signal<any>(this.authService.obtenerUsuarioActual());
  resumen = signal<ResumenReporte | null>(null);
  pagos = signal<any[]>([]);
  propiedadesReporte = signal<any | null>(null);
  usuariosReporte = signal<any | null>(null);
  empresasReporte = signal<any[]>([]);
  cargando = signal<boolean>(true);
  descargando = signal<boolean>(false);

  // Filtros de período (por defecto últimos 30 días)
  desde = '';
  hasta = '';

  esAdmin(): boolean {
    const rol = (this.user()?.rol || this.user()?.rolUsuario || this.user()?.role || '').toString().toUpperCase();
    return ['SUPER_ADMIN', 'ADMIN_EMPRESA'].includes(rol);
  }

  esSuperAdmin(): boolean {
    return (this.user()?.rol || this.user()?.rolUsuario || this.user()?.role || '').toString().toUpperCase() === 'SUPER_ADMIN';
  }

  ngOnInit(): void {
    const hoy = new Date();
    const hace30 = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.hasta = hoy.toISOString().slice(0, 10);
    this.desde = hace30.toISOString().slice(0, 10);
    this.cargar();
  }

  cargar(): void {
    if (!this.esAdmin()) {
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);

    this.reportesService.resumen(this.desde, this.hasta).subscribe({
      next: (r) => {
        this.resumen.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        console.error('Error cargando resumen de reportes', e);
        this.cargando.set(false);
      },
    });

    this.reportesService.pagos(this.desde, this.hasta).subscribe({
      next: (lista) => this.pagos.set(lista || []),
      error: (e) => {
        console.error('Error cargando pagos del reporte', e);
        this.pagos.set([]);
      },
    });

    this.reportesService.propiedadesPorEstado().subscribe({
      next: (r) => this.propiedadesReporte.set(r),
      error: (e) => console.error('Error cargando reporte de propiedades', e),
    });

    this.reportesService.usuariosPorRol().subscribe({
      next: (r) => this.usuariosReporte.set(r),
      error: (e) => console.error('Error cargando reporte de usuarios', e),
    });

    if (this.esSuperAdmin()) {
      this.reportesService.empresasResumen().subscribe({
        next: (lista) => this.empresasReporte.set(lista || []),
        error: (e) => console.error('Error cargando reporte de empresas', e),
      });
    }
  }

  descargarCsv(): void {
    this.descargando.set(true);
    this.reportesService.descargarPagosCsv(this.desde, this.hasta).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-pagos-${this.hasta}.csv`;
        enlace.click();
        URL.revokeObjectURL(url);
        this.descargando.set(false);
      },
      error: (e) => {
        console.error('Error descargando el reporte', e);
        this.descargando.set(false);
      },
    });
  }
}
