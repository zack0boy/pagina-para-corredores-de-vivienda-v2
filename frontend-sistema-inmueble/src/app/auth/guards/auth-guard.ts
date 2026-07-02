import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Revisa el método que creaste en tu servicio
  if (authService.estaLogueado()) {
    return true; // ✅ Tiene token, lo dejamos pasar a la página protegida
  }

  // 2. Si no está logueado, lo mandamos directo al login
  router.navigate(['/login']); 
  return false; // ❌ Bloqueamos el acceso
};