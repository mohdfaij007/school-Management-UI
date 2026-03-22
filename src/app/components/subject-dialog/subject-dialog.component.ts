import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-subject-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule
  ],
  templateUrl: './subject-dialog.component.html',
  styleUrl: './subject-dialog.component.scss'
})
export class SubjectDialogComponent {
  subjectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SubjectDialogComponent>
  ) {
    // Enterprise Standard: Initialize Reactive Form with strict validations
    this.subjectForm = this.fb.group({
      subjectName: ['', [Validators.required, Validators.minLength(2)]],
      subjectCode: ['', Validators.required],
      subjectType: ['THEORY', Validators.required] // Default value set
    });
  }

  onSubmit() {
    if (this.subjectForm.valid) {
      // Send form data back to the parent component
      this.dialogRef.close(this.subjectForm.value);
    } else {
      this.subjectForm.markAllAsTouched(); // Show validation errors
    }
  }

  onCancel() {
    this.dialogRef.close(); // Close without saving
  }
}