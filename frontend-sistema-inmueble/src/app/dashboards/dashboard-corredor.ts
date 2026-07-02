import { Component, OnInit, inject, signal } from '@angular/core';
import { Navbar } from "../components/navbar/navbar";
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { DashboardService } from '../services/dashboard';
import { PropiedadService } from '../services/propiedad';

@Component({
  selector: 'app-dashboard-corredor',
  standalone: true,
  imports: [Navbar, CommonModule],
  templateUrl: './dashboard-corredor.html',
  styleUrl: './dashboards.css',
})
export class DashboardCorredor implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private propiedadService = inject(PropiedadService);

  dashboard = signal<any>(null);
  cargando = signal<boolean>(true);
  propiedades = signal<any[]>([]);

  ngOnInit(): void {
    this.cargando.set(true);
    const user = this.authService.obtenerUsuarioActual();

    if (!user) {
      this.cargando.set(false);
      return;
    }

    this.propiedadService.findAll({ page: 1, limit: 10 }).subscribe({ next: (res) => {
      const data = res.data ? res.data : res;
      this.propiedades.set(data || []);
    }, error: (e) => console.error('Error cargando propiedades', e) });

    const corredorId = user.id || user.corredorId;
    this.dashboardService.corredor(corredorId).subscribe({ next: (d) => { this.dashboard.set(d); this.cargando.set(false); }, error: (e) => { console.error(e); this.cargando.set(false); } });
  }
}
