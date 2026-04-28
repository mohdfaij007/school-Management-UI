import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}/api/dashboard`;

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
 

  getMetrics(): Observable<any> {
    return this.http.get(`${API_URL}/metrics`);
  }
}