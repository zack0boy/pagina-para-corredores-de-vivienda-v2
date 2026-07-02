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
}
