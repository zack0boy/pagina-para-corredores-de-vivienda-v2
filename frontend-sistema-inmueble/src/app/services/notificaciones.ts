import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  misNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  noLeidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/no-leidas`);
  }

  marcarLeida(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/leer`, {});
  }
}
