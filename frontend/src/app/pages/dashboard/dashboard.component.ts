import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardsService } from '../../services/dashboards.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent

  implements OnInit {
    
  stats: any = {};
  errorMessage: string | null = null;

  constructor(
    private dashboardService: DashboardsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    console.log('[DASHBOARD] ngOnInit iniciado');
    
    const user = this.authService.getUser();
    console.log('[DASHBOARD] Usuario recuperado de localStorage:', user);

    if (!user) {
      console.error('[DASHBOARD] No hay usuario autenticado en localStorage');
      this.errorMessage = 'No se encontró información del usuario. Inicia sesión de nuevo.';
      return;
    }

    const token = this.authService.getToken();
    console.log('[DASHBOARD] Token disponible:', token ? 'SÍ' : 'NO');

    if (user.rol === 'SUPER_ADMIN') {
      console.log('[DASHBOARD] Solicitando dashboard de SUPER_ADMIN');
      this.dashboardService.getSuperAdminDashboard().subscribe({
        next: (data) => {
          console.log('[DASHBOARD] Datos obtenidos:', data);
          this.stats = data;
        },
        error: (err) => {
          console.error('[DASHBOARD] Error al obtener datos:', err);
          this.errorMessage = 'Error al obtener los datos del dashboard del superadministrador.';
        }
      });
      return;
    }

    if (user.rol === 'CORREDOR') {
      console.log('[DASHBOARD] Solicitando dashboard de CORREDOR con ID:', user.id);
      this.dashboardService.getCorredorDashboard(user.id).subscribe({
        next: (data) => {
          console.log('[DASHBOARD] Datos obtenidos:', data);
          this.stats = data;
        },
        error: (err) => {
          console.error('[DASHBOARD] Error al obtener datos:', err);
          this.errorMessage = 'Error al obtener los datos del dashboard del corredor.';
        }
      });
      return;
    }

    if (user.rol === 'ADMIN_EMPRESA') {
      if (!user.empresaId) {
        console.error('[DASHBOARD] No se encontró empresaId en el usuario autenticado');
        this.errorMessage = 'Falta el identificador de empresa para mostrar el dashboard.';
        return;
      }

      console.log('[DASHBOARD] Solicitando dashboard de ADMIN_EMPRESA con ID:', user.empresaId);
      this.dashboardService.getAdminEmpresaDashboard(user.empresaId).subscribe({
        next: (data) => {
          console.log('[DASHBOARD] Datos obtenidos:', data);
          this.stats = data;
        },
        error: (err) => {
          console.error('[DASHBOARD] Error al obtener datos:', err);
          this.errorMessage = 'Error al obtener los datos del dashboard de la empresa.';
        }
      });
      return;
    }

    console.error('[DASHBOARD] Rol de usuario no soportado:', user.rol);
    this.errorMessage = 'Rol de usuario no soportado para mostrar el dashboard.';
  }
}