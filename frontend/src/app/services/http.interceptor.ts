import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token a la solicitud
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error en la solicitud';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del servidor
          if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            this.authService.logout();
          } else if (error.status === 403) {
            errorMessage = 'No tienes permiso para acceder a este recurso.';
          } else if (error.status === 404) {
            errorMessage = 'Recurso no encontrado.';
          } else if (error.status === 500) {
            errorMessage = 'Error del servidor. Intenta más tarde.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `Error ${error.status}: ${error.statusText}`;
          }
        }

        this.toastService.showError(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
