import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = 'http://localhost:3000/notificaciones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getByUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
