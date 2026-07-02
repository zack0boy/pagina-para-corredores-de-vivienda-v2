import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearSolicitudPropiedad {
  empresa_id?: string;
  solicitante_nombre: string;
  solicitante_email?: string;
  solicitante_telefono?: string;
  titulo: string;
  descripcion?: string;
  direccion: string;
  precio: number;
  tipo_operacion?: string;
  categoria_id?: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitudesPropiedadService {
  private apiUrl = `${environment.apiUrl}/solicitudes-propiedad`;

  constructor(private http: HttpClient) {}

  crear(dto: CrearSolicitudPropiedad): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  pendientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pendientes`);
  }

  // estado: 'APROBADA' | 'RECHAZADA'
  resolver(id: string, dto: { estado: string; corredor_id?: string; motivo_rechazo?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/resolver`, dto);
  }
}
