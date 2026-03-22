import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}/api/students`;

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private http: HttpClient) { }

 getAll(): Observable<any> {
    return this.http.get(API_URL);
  }

  get(id: any): Observable<any> {
    return this.http.get(`${API_URL}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(API_URL, data);
  }

  update(id: any, data: any): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, data);
  }

  delete(id: any): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  uploadPhoto(id: any, file: File): Observable<any> 
  {
  const formData: FormData = new FormData();
  formData.append('file', file);
  return this.http.post(`${API_URL}/${id}/photo`, formData, { responseType: 'text' });
  }



  // // --- NEW SEARCH METHOD ---
  // search(keyword: string,standardId: string, sectionId: string): Observable<any> {
  //   // Build query string
  // let queryParams = `?keyword=${keyword || ''}`;
  // if (standardId) queryParams += `&standardId=${standardId}`;
  // if (sectionId) queryParams += `&sectionId=${sectionId}`;
  
  //   return this.http.get(`${API_URL}/search?keyword=${keyword}`);
  // }


  //  search(keyword: string, standardId: string, sectionId: string, page: number, size: number): Observable<any> {
  //   let queryParams = `?page=${page}&size=${size}`;
  //   if (keyword) queryParams += `&keyword=${keyword}`;
  //   if (standardId) queryParams += `&standardId=${standardId}`;
  //   if (sectionId) queryParams += `&sectionId=${sectionId}`;
    
  //   return this.http.get(`${API_URL}/search${queryParams}`);
  // }


  search(keyword: string, standardId: string, sectionId: string, page: number, size: number): Observable<any> {
    
    // 1. Initialize Params (HttpParams is immutable, so we chain .set)
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    // 2. Conditionally append optional filters
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (standardId) {
      params = params.set('standardId', standardId);
    }
    if (sectionId) {
      params = params.set('sectionId', sectionId);
    }

    // 3. Pass { params } in the options object
    // Angular will automatically build: /search?page=0&size=10&keyword=Rahul%20Gupta
    return this.http.get(`${API_URL}/search`, { params });

  }
// Optimized fetch for lists
getStudentsByClass(classId: number, sectionId: number, sessionId: number): Observable<any[]> {
    let params = new HttpParams()
      .set('classId', classId)
      .set('sectionId', sectionId)
      .set('sessionId', sessionId);

    return this.http.get<any[]>(`${API_URL}/by-class`, { params });
  }

}
