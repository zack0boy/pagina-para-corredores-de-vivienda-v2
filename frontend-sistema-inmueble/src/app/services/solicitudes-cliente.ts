import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SolicitudesClienteService {
  private apiUrl = `${environment.apiUrl}/solicitudes-cliente`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  findPendientesByEmpresa(empresaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresa/${empresaId}/pendientes`);
  }

  // estado: 'APROBADA' | 'RECHAZADA'
  resolver(id: string, dto: { estado: string; motivo_rechazo?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/resolver`, dto);
  }
}
