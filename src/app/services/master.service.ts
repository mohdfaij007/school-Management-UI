import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


const API_URL = `${environment.apiUrl}/api/master`;

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor(private http: HttpClient) { }

  getAllSessions(): Observable<any> {
    return this.http.get(`${API_URL}/session/all`);
  }

  getAllStandards(): Observable<any> {
    return this.http.get(`${API_URL}/standard/all`);
  }

  getAllSections(): Observable<any> {
    return this.http.get(`${API_URL}/section/all`);
  }

  getAllClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/standard/all`);
  }

  // --- ADD (POST) APIs ---
  addSession(sessionData: any): Observable<any> {
    return this.http.post(`${API_URL}/session/add`, sessionData);
  }

  addStandard(standardData: any): Observable<any> {
    return this.http.post(`${API_URL}/standard/add`, standardData);
  }

  addSection(sectionData: any): Observable<any> {
    return this.http.post(`${API_URL}/section/add`, sectionData);
  }



  // --- DELETE APIs ---
  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/session/delete/${id}`, { responseType: 'text' });
  }

  deleteStandard(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/standard/delete/${id}`, { responseType: 'text' });
  }

  deleteSection(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/section/delete/${id}`, { responseType: 'text' });
  }


  // --- SET ACTIVE SESSION API ---
  markSessionActive(id: number): Observable<any> {
    return this.http.put(`${API_URL}/session/mark-active/${id}`, {}, { responseType: 'text' });
  }
  
}
