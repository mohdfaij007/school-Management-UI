import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-date-selection-dialog',
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    FormsModule
  ],
  templateUrl: './date-selection-dialog.component.html',
  styleUrl: './date-selection-dialog.component.scss'
})
export class DateSelectionDialogComponent {

  startDate: Date = new Date(); // Default to Today
  endDate: Date | null = null;

  constructor(
    public dialogRef: MatDialogRef<DateSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(null); // Return nothing
  }

  onConfirm(): void {
    this.dialogRef.close({
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

}
