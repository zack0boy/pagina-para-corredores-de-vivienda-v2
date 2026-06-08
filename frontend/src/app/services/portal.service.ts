import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortalService {
  private apiUrl = 'http://localhost:3000/portal';

  constructor(private http: HttpClient) {}

  getPropiedades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/propiedades`);
  }

  getPropiedadDetalle(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/propiedades/${id}`);
  }
}
