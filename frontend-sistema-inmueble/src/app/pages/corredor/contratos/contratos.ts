import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContratosService } from '../../../services/contratos';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-contratos-corredor',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './contratos.html',
  styleUrl: './contratos.css',
})
export class ContratosCorredor implements OnInit {
  private service = inject(ContratosService);
  private authService = inject(AuthService);

  user = this.authService.obtenerUsuarioActual();

  contratos = signal<any[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string>('');

  filtroEstado = signal<string>('TODOS');
  filtroTipo = signal<string>('TODOS');

  esAdmin = computed(() => this.user?.rol === 'ADMIN_EMPRESA' || this.user?.rol === 'SUPER_ADMIN');

  contratosFiltrados = computed(() => {
    let lista = this.contratos();
    if (this.filtroEstado() !== 'TODOS') {
      lista = lista.filter((c) => c.estado === this.filtroEstado());
    }
    if (this.filtroTipo() !== 'TODOS') {
      lista = lista.filter((c) => c.tipo === this.filtroTipo());
    }
    return lista;
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    // El backend ya acota automáticamente por corredor/empresa según el rol del token.
    this.service.findAll().subscribe({
      next: (data) => {
        this.contratos.set(Array.isArray(data) ? data : []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los contratos.');
        this.cargando.set(false);
      },
    });
  }

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor || 0);
  }
}
