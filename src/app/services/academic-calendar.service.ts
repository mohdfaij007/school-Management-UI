import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}/api/calendar`;

@Injectable({
  providedIn: 'root'
})
export class AcademicCalendarService {

  constructor(private http: HttpClient) { }

  getCalendarBySession(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/session/${sessionId}`);
  }

  addSingleHoliday(payload: any): Observable<any> {
    return this.http.post(API_URL, payload);
  }

  markAllSundays(sessionId: number): Observable<any> {
    // backend returns a simple string, so responseType 'text' is needed
    return this.http.post(`${API_URL}/bulk-sundays/${sessionId}`, {}, { responseType: 'text' });
  }

  markVacationRange(payload: any): Observable<any> {
    return this.http.post(`${API_URL}/bulk-vacation`, payload, { responseType: 'text' });
  }

  deleteHoliday(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`, { responseType: 'text' });
  }
}