import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PropiedadService } from '../../services/propiedad';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-corredor-gestion',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class CorredorGestion implements OnInit {
  private propiedadService = inject(PropiedadService);
  private authService = inject(AuthService);

  propiedades = signal<any[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  toast = signal<string>('');
  busqueda = signal<string>('');

  user = this.authService.obtenerUsuarioActual();

  // Filtrado en vivo por título, dirección o código
  propiedadesFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.propiedades();
    return this.propiedades().filter(
      (p) =>
        p.titulo?.toLowerCase().includes(q) ||
        p.direccion?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.propiedadService
      .findAll({ corredorId: this.user?.id, limit: 50 })
      .subscribe({
        next: (res) => {
          this.propiedades.set(res?.data ?? res ?? []);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las propiedades.');
          this.cargando.set(false);
        },
      });
  }

  cambiarEstado(id: string, estado: string): void {
    this.propiedadService.update(id, { estado }).subscribe({
      next: () => {
        this.propiedades.update((lista) =>
          lista.map((p) => (p.id === id ? { ...p, estado } : p)),
        );
        this.mostrarToast('Estado actualizado');
      },
      error: () => this.error.set('No se pudo actualizar el estado.'),
    });
  }

  eliminar(id: string): void {
    if (!confirm('¿Eliminar esta propiedad? Esta acción no se puede deshacer.')) return;
    this.propiedadService.remove(id).subscribe({
      next: () => {
        this.propiedades.update((lista) => lista.filter((p) => p.id !== id));
        this.mostrarToast('Propiedad eliminada');
      },
      error: () => this.error.set('No se pudo eliminar la propiedad.'),
    });
  }

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor || 0);
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
