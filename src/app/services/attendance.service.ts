import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}/api/attendance`;

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private http: HttpClient) { }

  getByDate(date: string): Observable<any> {
    return this.http.get(`${API_URL}?date=${date}`);
  }

  // Naya: Class aur Section wise kisi din ki attendance nikalne ke liye (For Report)
  getAttendanceForClass(standardId: number, sectionId: number, date: string): Observable<any> {
    let params = new HttpParams()
      .set('standardId', standardId)
      .set('sectionId', sectionId)
      .set('date', date);
    return this.http.get(`${API_URL}/class-record`, { params });
  }

  // Naya: 7-Days History aur mark karne wali list lane ke liye
getAttendanceDashboard(standardId: number, sectionId: number, sessionId: number, date: string): Observable<any> {
    let params = new HttpParams()
      .set('standardId', standardId)
      .set('sectionId', sectionId)
      .set('sessionId', sessionId)
      .set('date', date); // <-- Nayi line
    return this.http.get(`${API_URL}/dashboard`, { params });
  }

  // Naya: Ek sath poori class ki attendance save karne ke liye
  markBulkAttendance(payload: any): Observable<any> {
    // responseType: 'text' zaroori hai kyunki backend String return kar raha hai
    return this.http.post(`${API_URL}/bulk`, payload, { responseType: 'text' });
  }



  getMonthlyRegister(standardId: number, sectionId: number, sessionId: number, year: number, month: number): Observable<any> {
    let params = new HttpParams()
      .set('standardId', standardId)
      .set('sectionId', sectionId)
      .set('sessionId', sessionId)
      .set('year', year)
      .set('month', month);
    return this.http.get(`${API_URL}/monthly-register`, { params });
  }

}