import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlantillasEmailService {
  private apiUrl = 'http://localhost:3000/plantillas-email';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getWithFilters(filters: any): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { params: filters });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
