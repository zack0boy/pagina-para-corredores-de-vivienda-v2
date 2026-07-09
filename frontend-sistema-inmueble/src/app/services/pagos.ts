import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearPagoManual {
  corredor_id?: string;
  cliente_id?: string;
  cliente_nombre: string;
  monto: number;
  fecha_pago: string;
  tipo_pago?: string;
  comentario?: string;
  propiedad_id?: string;
  propiedad_titulo?: string;
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private apiUrl = `${environment.apiUrl}/pagos`;
  private comprobanteUrl = `${environment.apiUrl}/comprobante`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  findByCorredor(corredorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/corredor/${corredorId}`);
  }
  
  findByCliente(clienteId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/cliente/${clienteId}`);
}

  crear(dto: CrearPagoManual): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  findPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pendientes`);
  }

  // Validar o rechazar un pago (admin / super admin)
  validar(pagoId: string, dto: { estado: string; validado_por: string; comentario?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${pagoId}/validar`, dto);
  }

  // Sube la evidencia (recibo) de un pago
  subirComprobante(pagoId: string, archivo: File, observaciones?: string): Observable<any> {
    const form = new FormData();
    form.append('archivo', archivo);
    if (observaciones) form.append('observaciones', observaciones);
    return this.http.post(`${this.comprobanteUrl}/${pagoId}/upload`, form);
  }

  // Comprobantes de un pago
  comprobantesPorPago(pagoId: string): Observable<any> {
    return this.http.get(`${this.comprobanteUrl}/pago/${pagoId}`);
  }

  // Ventas del propio corredor (nunca de otros corredores)
  resumenCorredor(corredorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen/corredor/${corredorId}`);
  }

  // Tabla de ventas por corredor dentro de una empresa (admin/superadmin)
  resumenEmpresa(empresaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen/empresa/${empresaId}`);
  }

  // Todas las empresas, separadas entre sí (solo superadmin)
  resumenTodasEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/resumen/todas-empresas`);
  }
}
