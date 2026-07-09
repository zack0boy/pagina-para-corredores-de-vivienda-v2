import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { NotificacionesBell } from '../notificaciones-bell/notificaciones-bell';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, NotificacionesBell],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected authService = inject(AuthService);
  private router = inject(Router);

  // ¿El usuario logueado es corredor?
  esCorredor(): boolean {
    const rol = (this.authService.obtenerUsuarioActual()?.rol || '').toString().toUpperCase();
    return rol === 'CORREDOR';
  }

  // ¿El usuario logueado es administrador?
isAdmin(): boolean {
  const rol = (
    this.authService.obtenerUsuarioActual()?.rol || ''
  ).toUpperCase();

  return [
    'SUPER_ADMIN',
    'ADMIN_EMPRESA'
  ].includes(rol);
}

  // Las notificaciones son solo para staff (corredor/admin/superadmin), no para clientes.
  esStaff(): boolean {
    const rol = (this.authService.obtenerUsuarioActual()?.rol || '').toString().toUpperCase();
    return ['CORREDOR', 'ADMIN_EMPRESA', 'SUPER_ADMIN'].includes(rol);
  }

  // Cierra sesión y redirige al inicio
  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
