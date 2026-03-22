import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FeeService } from '../../../services/fee.service';
import { DateSelectionDialogComponent } from '../dialogs/date-selection-dialog/date-selection-dialog.component';

@Component({
  selector: 'app-student-fee-dialog',
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatCheckboxModule, 
    MatButtonModule, 
    MatIconModule,
    MatListModule
  ],
  templateUrl: './student-fee-dialog.component.html',
  styleUrl: './student-fee-dialog.component.scss',
  providers: [DatePipe]
})
export class StudentFeeDialogComponent implements OnInit{

  feeOptions: any[] = [];
  loading = true;
  studentId: number;
  constructor(
    public dialogRef: MatDialogRef<StudentFeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Contains studentId, classId, etc.
    private feeService: FeeService,
    private dialog: MatDialog, // 👈 Inject Dialog
    private datePipe: DatePipe // 👈 Inject DatePipe to format dates
  ) {
    this.studentId = data.studentId;
  }

  ngOnInit(): void {
    this.loadFees();
  }

  loadFees() {
    this.loading = true;
    this.feeService.getFeeOptionsForStudent(
      this.data.studentId, 
      this.data.classId, 
      this.data.sessionId
    ).subscribe({
      next: (res) => {
        this.feeOptions = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading fees', err);
        this.loading = false;
      }
    });
  }

  toggleFee(fee: any, event: any) {// CASE 1: Turning OFF (Simple)
  if (!event.checked) {
    this.updateFeeStatus(fee, false, null, null);
    return;
  }

  // CASE 2: Turning ON (Show Popup)
  // Revert toggle visually first (wait for confirmation)
  event.source.checked = false; 

  const dialogRef = this.dialog.open(DateSelectionDialogComponent, {
    width: '400px',
    data: { feeHeadName: fee.feeHeadName }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // User Confirmed!
      event.source.checked = true; // Turn Toggle ON visually
      
      // Format Dates to YYYY-MM-DD
      const start = this.datePipe.transform(result.startDate, 'yyyy-MM-dd');
      const end = result.endDate ? this.datePipe.transform(result.endDate, 'yyyy-MM-dd') : null;

      this.updateFeeStatus(fee, true, start, end);
    }
  });
  }

  //  Helper API Call
updateFeeStatus(fee: any, isActive: boolean, startDate: any, endDate: any) {
  this.feeService.toggleStudentFee(this.studentId, fee.feeStructureId, isActive, startDate, endDate)
    .subscribe({
      next: (res) => {
        console.log('Success', res);
        fee.isActive = isActive; // Update local model
      },
      error: (err) => {
        console.error('Error', err);
        fee.isActive = !isActive; // Revert on error
      }
    });
  }
}
