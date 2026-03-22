import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentMarksDTO } from '../models/marks.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarksService {
  private baseUrl = `${environment.apiUrl}/api/marks`;

  constructor(private http: HttpClient) {}

  // Get previously saved marks for a specific subject mapping
  getMarksForMapping(mappingId: number): Observable<StudentMarksDTO[]> {
    return this.http.get<StudentMarksDTO[]>(`${this.baseUrl}/mapping/${mappingId}`);
  }

  // Bulk save marks for the whole class
  saveBulkMarks(marksList: StudentMarksDTO[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk-save`, marksList, { responseType: 'text' });
  }
}