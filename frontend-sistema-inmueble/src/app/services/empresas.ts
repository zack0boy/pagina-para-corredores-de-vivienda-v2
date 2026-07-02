import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmpresaDto {
  nombre: string;
  rut?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  plan?: string;
}

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private apiUrl = `${environment.apiUrl}/empresas`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  findOne(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(dto: EmpresaDto): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<EmpresaDto> & { estado?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
