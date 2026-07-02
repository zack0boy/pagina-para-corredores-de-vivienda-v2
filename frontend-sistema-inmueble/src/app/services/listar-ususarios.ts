import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  //=========================
  // USUARIOS GENERALES
  //=========================

  getAll(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => p = p.append(k, params[k]));
    }
    return this.http.get<any>(this.apiUrl, { params: p });
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  //=========================
  // CLIENTES
  //=========================

  getAllClientes(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => p = p.append(k, params[k]));
    }
    return this.http.get<any>(`${this.apiUrl}/clientes`, { params: p });
  }

  getCliente(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/${id}`);
  }

  createCliente(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, dto);
  }

  updateCliente(id: string, dto: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/clientes/${id}`, dto);
  }

  deleteCliente(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clientes/${id}`);
  }

  // Bloquear (activo=false) o desbloquear (activo=true) un cliente
  bloquearCliente(id: string, activo: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/clientes/${id}/bloqueo`, { activo });
  }

  //=========================
  // CORREDORES
  //=========================

  getAllCorredores(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => p = p.append(k, params[k]));
    }
    return this.http.get<any>(`${this.apiUrl}/corredores`, { params: p });
  }

  getCorredor(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/corredores/${id}`);
  }

  createCorredor(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/corredores`, dto);
  }

  updateCorredor(id: string, dto: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/corredores/${id}`, dto);
  }

  deleteCorredor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/corredores/${id}`);
  }

  // Nominar un corredor como administrador de una empresa (solo SUPER_ADMIN)
  promoverAdmin(id: string, empresaId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/corredores/${id}/promover-admin`, { empresa_id: empresaId });
  }

  //=========================
  // ADMINS / SUPER ADMINS
  //=========================

  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admins`);
  }

  getSuperAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/super-admins`);
  }

  updateAdmin(id: string, dto: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admins/${id}`, dto);
  }

  // Subir un admin de empresa a super admin (solo SUPER_ADMIN)
  promoverSuperAdmin(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admins/${id}/promover-super`, {});
  }
}
