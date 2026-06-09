import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardsService {

  private apiUrl = 'http://localhost:3000/dashboard';

  constructor(private http: HttpClient) {}

  getSuperAdminDashboard(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/super-admin`
    );
  }

  getAdminEmpresaDashboard(
    empresaId: string
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin-empresa/${empresaId}`
    );
  }

  getCorredorDashboard(
    corredorId: string
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/corredor/${corredorId}`
    );
  }
} 