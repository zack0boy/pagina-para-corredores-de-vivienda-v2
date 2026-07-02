import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // GET /users
  getAll(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => p = p.append(k, params[k]));
    }
    return this.http.get<any>(this.apiUrl, { params: p });
  }

  // GET /users/me
  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // GET /users/corredores/:id
  getCorredor(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/corredores/${id}`);
  }

  // PATCH /users/corredores/:id
  updateCorredor(id: string, dto: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/corredores/${id}`, dto);
  }
}
