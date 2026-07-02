import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface RegisterDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  empresa_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  // POST /auth/register
  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }

  // POST /auth/verify-email
  verifyEmail(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { email, codigo });
  }

  // POST /auth/resend-verification
  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  // POST /auth/login
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  // POST /auth/google
  googleLogin(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google`, { token }).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  // POST /auth/forgot-password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // POST /auth/reset-password
  resetPassword(email: string, codigo: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, codigo, newPassword });
  }

  // Métodos de ayuda para el Estado de la App
  private guardarSesion(res: any): void {
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  obtenerUsuarioActual(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}