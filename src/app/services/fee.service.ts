import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FeeService {
  // Update this if your port is different
  private baseUrl = 'http://localhost:8080/api/fees';

  constructor(private http: HttpClient) { }




  // --- FEE HEADS (The Types of Fees) ---

  getFeeHeads(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/head`);
  }

  createFeeHead(feeHead: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/head`, feeHead);
  }


  


  // --- FEE STRUCTURES (The Amounts) ---

  // Get fees for a specific class and session
  getFeeStructures(classId: number, sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/structure/${classId}/${sessionId}`);
  }

  createFeeStructure(feeStructure: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/structure`, feeStructure);
  }

  // 3. (Optional) Delete a fee structure
  deleteFeeStructure(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/structure/${id}`);
  }

  // --- ADD TO FeeService (Frontend) ---

  getFeeStructureById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/structure/${id}`);
  }

  updateFeeStructure(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/structure/${id}`, data);
  }
    getFeeStructuresBySession(sessionId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/structure/session/${sessionId}`);
  }
  

}

