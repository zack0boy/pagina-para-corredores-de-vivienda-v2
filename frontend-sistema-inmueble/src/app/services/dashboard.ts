import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  superAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/super-admin`);
  }

  adminEmpresa(empresaId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-empresa/${empresaId}`);
  }

  corredor(corredorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/corredor/${corredorId}`);
  }

  cliente(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cliente`);
  }
}
