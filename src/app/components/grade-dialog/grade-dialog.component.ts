import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-grade-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './grade-dialog.component.html',
  styleUrl: './grade-dialog.component.scss'
})
export class GradeDialogComponent {
  gradeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GradeDialogComponent>
  ) {
    this.gradeForm = this.fb.group({
      gradeName: ['', [Validators.required, Validators.maxLength(10)]],
      minPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      maxPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      gradePoint: ['', [Validators.required, Validators.min(0)]],
      remarks: [''] // Optional field
    });
  }

  onSubmit() {
    if (this.gradeForm.valid) {
      const formValue = this.gradeForm.value;
      // Extra safety check before sending to backend
      if (formValue.minPercentage >= formValue.maxPercentage) {
        this.gradeForm.get('minPercentage')?.setErrors({ 'invalidRange': true });
        return;
      }
      this.dialogRef.close(formValue);
    } else {
      this.gradeForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}