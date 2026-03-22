import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GradeMasterDTO } from '../models/grade.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private baseUrl = `${environment.apiUrl}/api/grades`;

  constructor(private http: HttpClient) {}

  getAllGrades(): Observable<GradeMasterDTO[]> {
    return this.http.get<GradeMasterDTO[]>(this.baseUrl);
  }

  createGrade(grade: GradeMasterDTO): Observable<GradeMasterDTO> {
    return this.http.post<GradeMasterDTO>(this.baseUrl, grade);
  }
}