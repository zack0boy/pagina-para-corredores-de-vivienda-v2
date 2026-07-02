import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { AuthService } from '../../services/auth';
import { EmpresasService } from '../../services/empresas';

@Component({
  selector: 'app-empresas-admin',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './empresas.html',
  styleUrls: ['../dashboard-admin.css', './empresas.css'],
})
export class EmpresasAdmin implements OnInit {
  protected authService = inject(AuthService);
  private empresasService = inject(EmpresasService);

  user = signal<any>(this.authService.obtenerUsuarioActual());
  empresas = signal<any[]>([]);
  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);

  // Modal crear / editar
  mostrarModal = false;
  editando: any = null;
  form: any = this.formVacio();

  esSuperAdmin(): boolean {
    return (this.user()?.rol || this.user()?.rolUsuario || this.user()?.role || '').toString().toUpperCase() === 'SUPER_ADMIN';
  }

  private formVacio() {
    return { nombre: '', rut: '', email: '', telefono: '', direccion: '', plan: 'BASICO' };
  }

  ngOnInit(): void {
    if (!this.esSuperAdmin()) {
      this.cargando.set(false);
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.empresasService.findAll().subscribe({
      next: (lista) => {
        this.empresas.set(Array.isArray(lista) ? lista : (lista as any)?.data ?? []);
        this.cargando.set(false);
      },
      error: (e) => {
        console.error('Error cargando empresas', e);
        this.cargando.set(false);
      },
    });
  }

  abrirCrear(): void {
    this.editando = null;
    this.form = this.formVacio();
    this.mostrarModal = true;
  }

  abrirEditar(empresa: any): void {
    this.editando = empresa;
    this.form = {
      nombre: empresa.nombre || '',
      rut: empresa.rut || '',
      email: empresa.email || '',
      telefono: empresa.telefono || '',
      direccion: empresa.direccion || '',
      plan: empresa.plan || 'BASICO',
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.editando = null;
  }

  guardar(): void {
    if (!this.form.nombre?.trim() || this.form.nombre.trim().length < 3) {
      alert('❌ El nombre debe tener al menos 3 caracteres');
      return;
    }

    const dto: any = { nombre: this.form.nombre.trim() };
    for (const campo of ['rut', 'email', 'telefono', 'direccion', 'plan']) {
      if (this.form[campo]?.trim?.()) dto[campo] = this.form[campo].trim();
    }

    this.guardando.set(true);
    const peticion = this.editando
      ? this.empresasService.update(this.editando.id, dto)
      : this.empresasService.create(dto);

    peticion.subscribe({
      next: () => {
        alert(this.editando ? '✅ Empresa actualizada' : '✅ Empresa creada');
        this.guardando.set(false);
        this.cerrarModal();
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        const msg = e.error?.message;
        alert('❌ Error al guardar: ' + (Array.isArray(msg) ? msg.join(', ') : msg || e.statusText));
      },
    });
  }

  cambiarEstado(empresa: any): void {
    const nuevoEstado = empresa.estado === 'ACTIVA' ? 'SUSPENDIDA' : 'ACTIVA';
    if (!confirm(`¿Cambiar la empresa "${empresa.nombre}" a ${nuevoEstado}?`)) return;

    this.empresasService.update(empresa.id, { estado: nuevoEstado }).subscribe({
      next: () => this.cargar(),
      error: (e) => alert('❌ Error al cambiar estado: ' + (e.error?.message || e.statusText)),
    });
  }

  eliminar(empresa: any): void {
    if (!confirm(`¿Eliminar la empresa "${empresa.nombre}"? Esta acción no se puede deshacer.`)) return;

    this.empresasService.remove(empresa.id).subscribe({
      next: () => {
        alert('✅ Empresa eliminada');
        this.cargar();
      },
      error: (e) => {
        if (e.status === 409 || e.status === 500) {
          alert('⚠️ No se puede eliminar: la empresa tiene datos asociados (corredores, propiedades, etc.)');
        } else {
          alert('❌ Error al eliminar: ' + (e.error?.message || e.statusText));
        }
      },
    });
  }
}
