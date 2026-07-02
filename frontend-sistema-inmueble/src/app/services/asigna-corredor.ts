import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AsignarCorredorDto {
  empresa_id: string;      // UUID requerido
  nombre: string;
  email?: string;          // El backend lo marca como optional
  telefono?: string;
}

export interface ConvertirClienteACorredorDto {
  usuario_id: string;           // UUID del cliente a convertir
  empresa_id?: string;          // UUID de la empresa (opcional: el backend usa la empresa del admin si no viene)
  licenciaProfesional?: string; // Opcional
  descripcion?: string;         // Opcional
}

@Injectable({ providedIn: 'root' })
export class AsignaCorredorService {
  private apiUrl = `${environment.apiUrl}/corredores`;

  constructor(private http: HttpClient) {}

  /**
   * Crear y asignar un corredor a una empresa
   * @param dto Datos del corredor incluyendo empresa_id
   */
  crearYAsignar(dto: AsignarCorredorDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, dto);
  }

  /**
   * Convertir un cliente existente a corredor
   * @param dto Datos para convertir (usuario_id, empresa_id, licenciaProfesional, descripcion)
   */
  convertirClienteAcorredor(dto: ConvertirClienteACorredorDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/convertir-cliente`, dto);
  }

  /**
   * Obtener todas las empresas
   */
  obtenerEmpresas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresas`);
  }
}
