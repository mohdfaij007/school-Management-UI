import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeeService } from '../../../services/fee.service';
import { StudentService } from '../../../services/student.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';

export interface FeeHeadDue{
  mappingId: number;
  feeHeadName: string;
  totalSessionAmount: number;
  amountAccruedTillDate: number;
  paidAmount: number;
  dueAmountStrict: number;
  dueAmountFull: number;
  paidUptoMonth: string;
}

export interface FeeDueReport{
  studentId: number;
  studentName: string;
  className: string;
  totalFeeAmount: number;
  totalPaidAmount: number;
  netDueAmount: number;
  dues: FeeHeadDue[];
}

@Component({
  selector: 'app-fee-collection',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatTableModule,
    MatIconModule, 
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule
  ],
  templateUrl: './fee-collection.component.html',
  styleUrl: './fee-collection.component.scss'
})
export class FeeCollectionComponent {

  report: FeeDueReport | null = null; 
  dataSource = new MatTableDataSource<FeeHeadDue>([]); 

  // Search
  searchAdmissionNo: string = '';
  studentFound: boolean = false;
  
  // Data
  dueReport: any = null;
  displayedColumns: string[] = ['head', 'amount', 'paid', 'due'];

  // Payment Form
  paymentMode: string = 'CASH';
  remarks: string = '';
  isProcessing: boolean = false;

  strictDueTotal: number = 0;
  fullSessionDueTotal: number = 0;
  paymentAmount: number = 0; 
  isPayFullSession: boolean = false; 

  transactionHistory: any[] = [];
  showHistory: boolean = false; 

  constructor(
    private feeService: FeeService,
    private studentService: StudentService, 
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    // Check if coming from Profile screen with an Admission Number
    this.route.queryParams.subscribe(params => {
      if (params['admNo']) {
        this.searchAdmissionNo = params['admNo'];
        this.searchStudent(); // Auto-trigger search
      }
    });
  }
  searchStudent() {
    if (!this.searchAdmissionNo) return;
    
    this.studentService.search(this.searchAdmissionNo, '', '', 0, 1).subscribe({
      next: (response: any) => {
        const students = response.content || response; 
        if (students.length > 0) {
          this.loadDues(students[0].id);
          this.loadHistory(students[0].id); // History yahan pehli baar load hoti hai
        } else {
          this.showMsg("Student not found!");
        }
      },
      error: () => this.showMsg("Error fetching student")
    });
  }

  loadDues(studentId: number) {
    if (!studentId) return;

    this.feeService.getStudentDues(studentId).subscribe({
      next: (data: FeeDueReport) => { 
        this.dueReport = data;
        this.report = data;
        this.dataSource.data = data.dues;
        this.studentFound = true;
        
        this.strictDueTotal = data.netDueAmount;
        
        this.fullSessionDueTotal = data.dues.reduce(
          (sum: number, item: FeeHeadDue) => sum + (item.dueAmountFull || 0), 
          0
        );

        this.paymentAmount = this.strictDueTotal;
      },
      error: (err) => {
        console.error('Error fetching dues', err);
        this.showMsg("Could not load fee details.");
        this.studentFound = false; 
      }
    });
  }

  togglePaymentMode(event: any) {
    this.isPayFullSession = event.checked;
    if (this.isPayFullSession) {
      this.paymentAmount = this.fullSessionDueTotal;
    } else {
      this.paymentAmount = this.strictDueTotal;
    }
  }

  processPayment() {
    if (this.paymentAmount <= 0) {
        this.showMsg("Enter a valid amount");
        return;
    }
    if (this.paymentAmount > this.dueReport.netDueAmount) {
        this.showMsg("Amount exceeds total due!");
        return;
    }

    this.isProcessing = true;
    
    const payload = {
      studentId: this.dueReport.studentId,
      amount: this.paymentAmount,
      paymentMode: this.paymentMode,
      remarks: this.remarks
    };

    this.feeService.collectFees(payload).subscribe({
      next: (res: any) => {
        this.showMsg("Payment Successful! Trans ID: " + res.transactionId);
        this.isProcessing = false;
        this.remarks = '';
        
        // FIX: Update both Bill and History after successful payment
        this.loadDues(this.dueReport.studentId);
        this.loadHistory(this.dueReport.studentId); // YEH LINE MISSING THI
      },
      error: (err) => {
        console.error(err);
        this.showMsg("Payment Failed: " + (err.error?.error || "Server Error"));
        this.isProcessing = false;
      }
    });
  }

  showMsg(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000 });
  }

  loadHistory(studentId: number) {
    this.feeService.getPaymentHistory(studentId).subscribe({
      next: (data) => {
        this.transactionHistory = data;
      },
      error: (err) => {
        console.error("Error loading history", err);
      }
    });
  }

  printReceipt(transaction: any) {
    const studentName = this.dueReport?.studentName || 'Student';
    const className = this.dueReport?.className || '';
    const date = new Date(transaction.transactionDate).toLocaleString();

    let rowsHtml = '';
    
    if (transaction.breakdown && transaction.breakdown.length > 0) {
      rowsHtml = transaction.breakdown.map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.feeHeadName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.amount}</td>
        </tr>
      `).join('');
    } else {
      rowsHtml = `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">Consolidated Payment</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${transaction.totalAmount}</td>
        </tr>`;
    }

    const receiptContent = `
      <html>
        <head>
          <title>Fee Receipt #${transaction.transactionId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #444; padding-bottom: 20px; }
            .school-name { font-size: 28px; font-weight: bold; color: #1a237e; margin: 0; }
            .receipt-title { font-size: 18px; font-weight: bold; margin-top: 15px; text-transform: uppercase; letter-spacing: 2px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .label { font-size: 12px; color: #666; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: 600; margin-top: 5px; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .details-table th { text-align: left; padding: 12px; background: #e3f2fd; border-bottom: 2px solid #1976d2; }
            .total-row td { font-weight: bold; font-size: 18px; background: #e8f5e9; color: #2e7d32; border-top: 2px solid #2e7d32; padding: 12px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px dashed #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">YOUR SCHOOL NAME</div>
            <div style="font-size:14px; color:#666;">Excellence in Education</div>
            <div class="receipt-title">Payment Receipt</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="label">Receipt No</div>
              <div class="value">#${transaction.transactionId}</div>
              <div style="margin-top: 10px;"></div>
              <div class="label">Date</div>
              <div class="value">${date}</div>
            </div>
            <div class="info-item">
              <div class="label">Student Name</div>
              <div class="value">${studentName}</div>
              <div style="margin-top: 10px;"></div>
              <div class="label">Class</div>
              <div class="value">${className}</div>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Fee Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              
              <tr class="total-row">
                <td>Total Paid</td>
                <td style="text-align: right;">₹${transaction.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Payment Mode:</strong> ${transaction.paymentMode} | <strong>Remarks:</strong> ${transaction.remarks || '-'}</p>
            <p>Thank you for your timely payment.</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    const popupWin = window.open('', '_blank', 'width=800,height=700');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(receiptContent);
      popupWin.document.close();
    }
  }
}