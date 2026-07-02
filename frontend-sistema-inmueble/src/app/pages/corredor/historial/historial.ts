import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PropiedadService } from '../../../services/propiedad';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-corredor-historial',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class HistorialCorredor implements OnInit {
  private propiedadService = inject(PropiedadService);
  private authService = inject(AuthService);

  items = signal<any[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string>('');

  user = this.authService.obtenerUsuarioActual();

  ngOnInit(): void {
    if (!this.user?.id) { this.cargando.set(false); return; }
    this.propiedadService.historial(this.user.id).subscribe({
      next: (d) => { this.items.set(Array.isArray(d) ? d : []); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar el historial.'); this.cargando.set(false); },
    });
  }

  icono(accion: string): string {
    const map: Record<string, string> = {
      CREADA: 'add_home',
      ACTUALIZADA: 'edit',
      ESTADO_CAMBIADO: 'swap_horiz',
      ELIMINADA: 'delete',
    };
    return map[accion] ?? 'history';
  }

  etiqueta(accion: string): string {
    const map: Record<string, string> = {
      CREADA: 'Creada',
      ACTUALIZADA: 'Actualizada',
      ESTADO_CAMBIADO: 'Cambio de estado',
      ELIMINADA: 'Eliminada',
    };
    return map[accion] ?? accion;
  }
}
