import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearContratoDto {
  empresa_id?: string;
  propiedad_id: string;
  cliente_id: string;
  corredor_id?: string;
  numero_contrato: string;
  tipo: 'VENTA' | 'ARRIENDO' | 'RESERVA';
  forma_pago: 'CUOTAS' | 'PAGO_UNICO';
  monto_total: number;
  fecha_inicio: string;
  fecha_fin?: string;
  monto_cuota_mensual?: number;
  dia_pago_mensual?: number;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class ContratosService {
  private apiUrl = `${environment.apiUrl}/contratos`;

  constructor(private http: HttpClient) {}

  findAll(filtros?: { empresa_id?: string; cliente_id?: string; corredor_id?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        if (v) params = params.set(k, v);
      });
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crear(dto: CrearContratoDto): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  actualizar(id: string, dto: Partial<CrearContratoDto>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, dto);
  }

  activar(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activar`, {});
  }

  finalizar(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/finalizar`, {});
  }

  cancelar(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancelar`, {});
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  descargarPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  subirFirmado(id: string, archivo: File): Observable<any> {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/${id}/upload-firmado`, form);
  }
}
