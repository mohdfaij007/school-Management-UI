import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/students';

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


   search(keyword: string, standardId: string, sectionId: string, page: number, size: number): Observable<any> {
    let queryParams = `?page=${page}&size=${size}`;
    if (keyword) queryParams += `&keyword=${keyword}`;
    if (standardId) queryParams += `&standardId=${standardId}`;
    if (sectionId) queryParams += `&sectionId=${sectionId}`;
    
    return this.http.get(`${API_URL}/search${queryParams}`);
  }



}
