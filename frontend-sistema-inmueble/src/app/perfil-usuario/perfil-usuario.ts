import { Component, OnInit, inject, signal } from '@angular/core';
import { UsersService } from '../services/perfil';
import { UsersService as UsersAdminService } from '../services/users';
import { Navbar } from '../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [Navbar, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
export class PerfilUsuario implements OnInit {

  private perfilService = inject(UsersService);
  private usersAdminService = inject(UsersAdminService);
  private fb = inject(FormBuilder);

  user = signal<any>(null);
  corredor = signal<any>(null);

  cargando = signal(true);
  editando = signal(false);
  guardando = signal(false);

  toast = signal('');
  error = signal('');

  form = this.fb.group({
    nombre: [''],
    email: [''],
    telefono: [''],
    licenciaProfesional: [''],
    descripcion: [''],
  });

  ngOnInit(): void {
    this.cargando.set(true);

    this.perfilService.me().subscribe({
      next: (usuario) => {
        this.user.set(usuario);
        const rol = this.obtenerRol(usuario);
        if (rol === 'CORREDOR') {
          this.usersAdminService.getCorredor(usuario.id).subscribe({ next: (c) => { this.corredor.set(c); this.patchFormCorredor(usuario, c); this.cargando.set(false); }, error: () => { this.patchForm(usuario); this.cargando.set(false); } });
        } else {
          this.patchForm(usuario);
          this.cargando.set(false);
        }
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      }
    });
  }

  iniciales(): string {
    const nombre =
      this.user()?.nombre ||
      this.user()?.name ||
      'U';

    return nombre
      .split(' ')
      .map((p: string) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  editar(): void {
    this.editando.set(true);
    this.error.set('');
  }

  cancelar(): void {
    this.editando.set(false);
    this.error.set('');
    const usuario = this.user();
    const rol = this.obtenerRol(usuario);

    if (rol === 'CORREDOR') {
      this.patchFormCorredor(usuario, this.corredor());
      return;
    }

    this.patchForm(usuario);
  }

  guardar(): void {
    const usuario = this.user();

    if (!usuario?.id) {
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const rol = this.obtenerRol(usuario);

    if (rol === 'CLIENTE') {
      this.guardarCliente(usuario);
      return;
    }

    if (rol === 'CORREDOR') {
      this.guardarCorredor(usuario);
      return;
    }

    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN_EMPRESA') {
      this.guardarUsuario(usuario);
      return;
    }

    this.guardando.set(false);
    this.error.set('Rol de usuario no soportado para actualizar el perfil.');

  }

  private guardarCliente(usuario: any): void {
    const dto = {
      nombre: this.form.value.nombre || undefined,
      email: this.form.value.email || undefined,
      telefono: this.form.value.telefono || undefined,
    };

    this.perfilService.updateCliente(usuario.id, dto).subscribe({
      next: (data: any) => {
        const actualizado = { ...usuario, ...data };
        this.user.set(actualizado);
        localStorage.setItem('user', JSON.stringify(actualizado));
        this.patchForm(actualizado);
        this.guardando.set(false);
        this.editando.set(false);
        this.mostrarToast('Perfil actualizado');
      },
      error: (err: any) => {
        console.error(err);
        this.guardando.set(false);
        this.error.set('No se pudo actualizar el perfil.');
      }
    });
  }

  private guardarCorredor(usuario: any): void {
    const dtoCor = {
      nombre: this.form.value.nombre || undefined,
      licenciaProfesional: this.form.value.licenciaProfesional || undefined,
      descripcion: this.form.value.descripcion || undefined,
    };

    this.usersAdminService.updateCorredor(usuario.id, dtoCor).subscribe({
      next: (data: any) => {
        const actualizado = { ...usuario, ...data };
        this.user.set(actualizado);
        localStorage.setItem('user', JSON.stringify(actualizado));
        this.corredor.set(data);
        this.patchFormCorredor(actualizado, data);
        this.guardando.set(false);
        this.editando.set(false);
        this.mostrarToast('Perfil actualizado');
      },
      error: (err: any) => {
        console.error(err);
        this.guardando.set(false);
        this.error.set('No se pudo actualizar el perfil.');
      }
    });
  }

  private guardarUsuario(usuario: any): void {
    const dto = {
      nombre: this.form.value.nombre || undefined,
      email: this.form.value.email || undefined,
      telefono: this.form.value.telefono || undefined,
    };

    this.perfilService.updateMe(dto).subscribe({
      next: (data: any) => {
        const actualizado = { ...usuario, ...data };
        this.user.set(actualizado);
        localStorage.setItem('user', JSON.stringify(actualizado));
        this.patchForm(actualizado);
        this.guardando.set(false);
        this.editando.set(false);
        this.mostrarToast('Perfil actualizado');
      },
      error: (err: any) => {
        console.error(err);
        this.guardando.set(false);
        this.error.set('No se pudo actualizar el perfil.');
      }
    });
  }

  private patchForm(usuario: any): void {

    this.form.patchValue({
      nombre: usuario?.nombre || usuario?.name || '',
      email: usuario?.email || '',
      telefono: usuario?.telefono || usuario?.phone || '',
      licenciaProfesional: '',
      descripcion: '',
    });

  }

  private patchFormCorredor(usuario: any, corredor: any): void {
    this.form.patchValue({
      nombre: usuario?.nombre || usuario?.name || '',
      email: usuario?.email || '',
      telefono: usuario?.telefono || usuario?.phone || '',
      licenciaProfesional: corredor?.licenciaProfesional || '',
      descripcion: corredor?.descripcion || '',
    });
  }

  private mostrarToast(mensaje: string): void {

    this.toast.set(mensaje);

    setTimeout(() => {
      this.toast.set('');
    }, 3000);

  }

  private obtenerRol(usuario: any): string {
    return (usuario?.rol || usuario?.role || usuario?.rolUsuario || '')
      .toString()
      .toUpperCase();
  }

  puedeVerAgregarPagos(): boolean {
    const rol = this.obtenerRol(this.user());
    return rol !== 'SUPER_ADMIN' && rol !== 'ADMIN_EMPRESA';
  }

}