import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:3000/email';

  constructor(private http: HttpClient) {}

  sendEmail(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data);
  }

  sendBatch(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-batch`, data);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
