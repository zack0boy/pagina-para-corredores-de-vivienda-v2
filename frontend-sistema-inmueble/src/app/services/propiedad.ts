import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz espejo de tu FilterPropiedadesDto en NestJS
export interface FiltrosPropiedad {
  categoriaId?: string;
  corredorId?: string;
  tipoOperacion?: string;
  estado?: string;
  precioMin?: number;
  precioMax?: number;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
  nombre?: string;
  empresaId?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropiedadService {
  private apiUrl = `${environment.apiUrl}/propiedades`;

  constructor(private http: HttpClient) { }

  // POST /propiedades
  create(propiedadData: any): Observable<any> {
    return this.http.post(this.apiUrl, propiedadData);
  }

  // GET /propiedades (Soporta paginación y filtros estructurados)
  findAll(filters?: FiltrosPropiedad): Observable<any> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }

    // Tu backend devuelve un objeto { data, total, page, limit, pages } si usas filtros
    return this.http.get<any>(this.apiUrl, { params });
  }

  // GET /propiedades/:id
  findOne(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // PATCH /propiedades/:id
  update(id: string, propiedadData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, propiedadData);
  }

  // DELETE /propiedades/:id
  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // POST /propiedad-imagen/:propiedadId  (sube una imagen a Cloudinary)
  subirImagen(propiedadId: string, archivo: File): Observable<any> {
    const form = new FormData();
    form.append('imagen', archivo);
    return this.http.post(`${environment.apiUrl}/propiedad-imagen/${propiedadId}`, form);
  }

  // GET imágenes de una propiedad
  imagenesPorPropiedad(propiedadId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/propiedad-imagen/propiedad/${propiedadId}`);
  }

  // DELETE imagen
  eliminarImagen(imagenId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/propiedad-imagen/${imagenId}`);
  }

  // PATCH orden de una imagen
  actualizarOrdenImagen(imagenId: string, orden: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/propiedad-imagen/${imagenId}/orden`, { orden });
  }

  // GET historial de cambios del corredor
  historial(corredorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/${corredorId}`);
  }
}