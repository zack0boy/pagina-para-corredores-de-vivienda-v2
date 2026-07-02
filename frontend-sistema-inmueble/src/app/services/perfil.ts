import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private normalizarPerfil(perfil: any): any {
    if (!perfil) {
      return null;
    }

    const raw = perfil.data ?? perfil.user ?? perfil.usuario ?? perfil;

    return {
      ...raw,
      id: raw.id || raw.user_id || raw.usuario_id || raw._id,
      nombre: raw.nombre || raw.name || raw.fullName || '',
      email: raw.email || '',
      telefono: raw.telefono || raw.phone || '',
      rol: raw.rol || raw.role || raw.rolUsuario || 'CLIENTE',
      direccion: raw.direccion || raw.address || raw.ciudad || '',
    };
  }

  private obtenerUsuarioCache(): any {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // GET /users/me
  me(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map((respuesta) => this.normalizarPerfil(respuesta)),
      catchError((err) => {
        const cache = this.obtenerUsuarioCache();
        if (cache) {
          return of(this.normalizarPerfil(cache));
        }
        return throwError(() => err);
      })
    );
  }

  // PATCH /users/clientes/:id
  updateCliente(id: string, dto: {
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/clientes/${id}`,
      dto
    ).pipe(map((respuesta) => this.normalizarPerfil(respuesta)));
  }

  // PATCH /users/me
  updateMe(dto: {
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/me`,
      dto
    ).pipe(map((respuesta) => this.normalizarPerfil(respuesta)));
  }

}