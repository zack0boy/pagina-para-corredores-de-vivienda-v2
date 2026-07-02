import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { UsersService } from '../../../services/users';

@Component({
  selector: 'app-corredor-perfil',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilCorredor implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  user = signal<any>(this.authService.obtenerUsuarioActual());
  corredor = signal<any>(null);
  cargando = signal<boolean>(true);
  editando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  toast = signal<string>('');
  error = signal<string>('');

  form = this.fb.group({
    nombre: [''],
    licenciaProfesional: [''],
    descripcion: [''],
  });

  ngOnInit(): void {
    const u = this.user();
    if (!u?.id) { this.cargando.set(false); return; }
    this.usersService.getCorredor(u.id).subscribe({
      next: (data) => {
        this.corredor.set(data);
        this.form.patchValue({
          nombre: u.nombre ?? '',
          licenciaProfesional: data?.licenciaProfesional ?? '',
          descripcion: data?.descripcion ?? '',
        });
        this.cargando.set(false);
      },
      error: () => { this.cargando.set(false); },
    });
  }

  iniciales(): string {
    const n = this.user()?.nombre ?? 'C';
    return n.split(' ').map((p: string) => p.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  editar(): void { this.editando.set(true); }
  cancelar(): void {
    this.editando.set(false);
    const u = this.user();
    this.form.patchValue({
      nombre: u?.nombre ?? '',
      licenciaProfesional: this.corredor()?.licenciaProfesional ?? '',
      descripcion: this.corredor()?.descripcion ?? '',
    });
  }

  guardar(): void {
    const u = this.user();
    if (!u?.id) return;
    this.guardando.set(true);
    this.error.set('');
    const dto = {
      nombre: this.form.value.nombre || undefined,
      licenciaProfesional: this.form.value.licenciaProfesional || undefined,
      descripcion: this.form.value.descripcion || undefined,
    };
    this.usersService.updateCorredor(u.id, dto).subscribe({
      next: (data) => {
        this.guardando.set(false);
        this.editando.set(false);
        this.corredor.set(data);
        // Actualizamos el nombre en la sesión local
        const actualizado = { ...u, nombre: this.form.value.nombre || u.nombre };
        localStorage.setItem('user', JSON.stringify(actualizado));
        this.user.set(actualizado);
        this.mostrarToast('Perfil actualizado');
      },
      error: () => { this.guardando.set(false); this.error.set('No se pudo actualizar el perfil.'); },
    });
  }

  private mostrarToast(m: string): void { this.toast.set(m); setTimeout(() => this.toast.set(''), 3000); }
}
