import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResumenReporte {
  periodo: { desde: string; hasta: string };
  totales: {
    empresas: number;
    usuarios: number;
    propiedades: number;
    corredores: number;
  };
  financiero: {
    pagos: number;
    montoTotal: number;
    cobrado: number;
    pendiente: number;
    rechazado: number;
    cantidadValidados: number;
    cantidadPendientes: number;
    cantidadRechazados: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  resumen(desde?: string, hasta?: string): Observable<ResumenReporte> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.http.get<ResumenReporte>(`${this.apiUrl}/resumen`, { params });
  }

  pagos(desde?: string, hasta?: string): Observable<any[]> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.http.get<any[]>(`${this.apiUrl}/pagos`, { params });
  }

  propiedadesPorEstado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/propiedades`);
  }

  usuariosPorRol(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  empresasResumen(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresas`);
  }

  descargarPagosCsv(desde?: string, hasta?: string): Observable<Blob> {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return this.http.get(`${this.apiUrl}/pagos/export`, {
      params,
      responseType: 'blob',
    });
  }
}
