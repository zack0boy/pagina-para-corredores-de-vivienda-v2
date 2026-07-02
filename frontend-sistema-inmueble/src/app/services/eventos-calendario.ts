import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearEventoDto {
  empresa_id: string;
  corredor_id: string;
  titulo: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class EventosCalendarioService {
  private apiUrl = `${environment.apiUrl}/eventos-calendario`;

  constructor(private http: HttpClient) {}

  findByCorredor(corredorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/corredor/${corredorId}`);
  }

  create(dto: CrearEventoDto): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CrearEventoDto>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, dto);
  }

  marcarCompletado(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/completar`, {});
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
