import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FeeService {
  // Update this if your port is different
  private baseUrl = `${environment.apiUrl}/api/fees`;

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
  
  // ... existing methods ...

  // 1. Trigger Auto-Assignment (e.g. after finding students who missed it)
  assignMandatoryFees(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/student-fees/assign-mandatory`, data);
  }

  // 2. Get the Checkbox Options for a specific student
  getFeeOptionsForStudent(studentId: number, classId: number, sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/student-fees/options/${studentId}?classId=${classId}&sessionId=${sessionId}`
    );
  }

  // 3. Toggle a Checkbox (Add/Remove Fee)
  toggleStudentFee(studentId: number, feeStructureId: number, isActive: boolean, startDate?: string, endDate?: string): Observable<any> {
    const payload = {
      studentId: studentId,
      feeStructureId: feeStructureId,
      isActive: isActive, // Explicitly send True/False
      startDate: startDate, // "2025-09-01" or null
      endDate: endDate      // "2025-10-31" or null
    };
    return this.http.post(`${this.baseUrl}/student-fees/toggle`, payload);
  }
  
  // ... existing methods ...

  // 1. Get Due Report (The Bill)
  getStudentDues(studentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/collection/due/${studentId}`);
  }

  // 2. Process Payment (The Cashier)
  collectFees(paymentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/collection/pay`, paymentData);
  }

  // 3. Get History
  getPaymentHistory(studentId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/collection/history/${studentId}`);
}

// Get Defaulters List
  getDefaulters(classId: number, sectionId: any): Observable<any[]> {
    let params = new HttpParams().set('classId', classId);
    if (sectionId) {
      params = params.set('sectionId', sectionId);
    }
    return this.http.get<any[]>(`${this.baseUrl}/collection/defaulters`, { params });
  }

  getDailyReport(date: string): Observable<any> {
    // Date format must be YYYY-MM-DD
    return this.http.get(`${this.baseUrl}/collection/daily-report?date=${date}`);
  }

  getHeadWiseReport(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/collection/head-wise-report?sessionId=${sessionId}`);
  }
}

