import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Ir a buscar el token al LocalStorage (tal cual lo guardó tu AuthService)
  const token = localStorage.getItem('token');

  // Listado de rutas públicas donde NO queremos enviar el token (evita problemas)
  const esRutaPublica = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  // 2. Si el token existe y no es una ruta pública, clonamos la petición inyectando el Bearer
  if (token && !esRutaPublica) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq); // Petición modificada enviada con éxito
  }

  // 3. Si no hay token o es pública, la petición sigue su curso normal sin alterar
  return next(req);
};