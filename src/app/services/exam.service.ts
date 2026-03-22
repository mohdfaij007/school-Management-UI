import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExamDTO, ExamSubjectMappingDTO } from '../models/exam.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private baseUrl = `${environment.apiUrl}/api/exams`;

  constructor(private http: HttpClient) {}

  // 1. Create a new Exam (e.g., "Half Yearly")
  createExam(exam: ExamDTO): Observable<ExamDTO> {
    return this.http.post<ExamDTO>(this.baseUrl, exam);
  }

  // 2. Fetch all exams (Note: Humein backend mein iska ek chota sa GET endpoint banana hoga)
  getAllExams(): Observable<ExamDTO[]> {
    return this.http.get<ExamDTO[]>(this.baseUrl);
  }

  // 3. Map Subject to Exam (Configuration & Timetable)
  mapSubjectToExam(mapping: ExamSubjectMappingDTO): Observable<ExamSubjectMappingDTO> {
    return this.http.post<ExamSubjectMappingDTO>(`${this.baseUrl}/map-subject`, mapping);
  }

  // 4. Get mapped subjects for a Class in a specific Exam
  getExamSubjectsForClass(examId: number, classId: number): Observable<ExamSubjectMappingDTO[]> {
    return this.http.get<ExamSubjectMappingDTO[]>(`${this.baseUrl}/${examId}/class/${classId}/subjects`);
  }
}