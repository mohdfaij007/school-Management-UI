import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportCardDTO } from '../models/report-card.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportCardService {
  private baseUrl = `${environment.apiUrl}/api/report-card`;

  constructor(private http: HttpClient) {}

  generateReportCard(studentId: number, examIds: number[], sessionId: number): Observable<ReportCardDTO> {
    // examIds ko comma-separated string banayenge (e.g., "1,2,3")
    const params = new HttpParams()
      .set('studentId', studentId.toString())
      .set('examIds', examIds.join(','))
      .set('sessionId', sessionId.toString());

    return this.http.get<ReportCardDTO>(`${this.baseUrl}/generate`, { params });
  }


  downloadReportCardPdf(studentId: number, examIds: number[], sessionId: number): Observable<Blob> {
    const params = new HttpParams()
      .set('studentId', studentId.toString())
      .set('examIds', examIds.join(','))
      .set('sessionId', sessionId.toString());

    // responseType 'blob' ensures Angular treats the response as a File
    return this.http.get(`${this.baseUrl}/download-pdf`, { params, responseType: 'blob' });
  }
}