import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
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

  // Cierra sesión y redirige al inicio
  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
