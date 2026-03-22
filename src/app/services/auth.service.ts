import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const AUTH_API = `${environment.apiUrl}/api/auth/`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'login', {
      username,
      password
    });
  }

  register(user: any): Observable<any> {
    return this.http.post(AUTH_API + 'register', {
      username: user.username,
      password: user.password,
      role: user.role
    });
  }
}
