import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


const API_URL = 'http://localhost:8080/api/master';

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
}
