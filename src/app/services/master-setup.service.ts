import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MasterSetupService {
  private baseUrl = `${environment.apiUrl}/api/master-setup`;

  constructor(private http: HttpClient) {}

  saveClassSectionMapping(payload: any) {
    return this.http.post(`${this.baseUrl}/map-class-sections`, payload, { responseType: 'text' });
  }

  getSetupBySession(sessionId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/by-session/${sessionId}`);
  }
}