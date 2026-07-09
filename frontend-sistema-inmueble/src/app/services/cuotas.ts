import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CuotasService {
  private apiUrl = `${environment.apiUrl}/cuotas`;

  constructor(private http: HttpClient) {}

  findByContrato(contratoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contrato/${contratoId}`);
  }

  reporte(contratoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reporte/${contratoId}`);
  }

  pendientesPorCorredor(corredorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/corredor/${corredorId}/pendientes`);
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
