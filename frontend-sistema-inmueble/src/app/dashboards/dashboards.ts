import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-dashboards',
  standalone: true,
  template: `<p>Redirigiendo al panel correspondiente...</p>`,
})
export class Dashboards implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const user = this.authService.obtenerUsuarioActual();
    const rol = user ? (user.rol || user.rolUsuario || user.role || user.rol) : null;

    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN_EMPRESA') {
      this.router.navigate(['/dashboards/admin']);
      return;
    }

    if (rol === 'CORREDOR') {
      this.router.navigate(['/dashboards/corredor']);
      return;
    }

    // Default fallback to corredor view
    this.router.navigate(['/dashboards/corredor']);
  }
}
