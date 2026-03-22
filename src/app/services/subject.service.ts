import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SubjectDTO } from '../models/subject.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  // Use environment variables in a real project: environment.apiUrl + '/api/subjects'
  private baseUrl = `${environment.apiUrl}/api/subjects`;

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<SubjectDTO[]> {
    return this.http.get<SubjectDTO[]>(this.baseUrl);
  }

  createSubject(subject: SubjectDTO): Observable<SubjectDTO> {
    return this.http.post<SubjectDTO>(this.baseUrl, subject);
  }
}
