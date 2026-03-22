import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-exam-dialog',
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
  templateUrl: './exam-dialog.component.html',
  styleUrl: './exam-dialog.component.scss'
})
export class ExamDialogComponent implements OnInit {
  examForm: FormGroup;
  
  // Future: Hum session list API se laayenge, abhi ke liye Hardcoded Active Session
  activeSessionId: number = 1; 

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ExamDialogComponent>
  ) {
    this.examForm = this.fb.group({
      examName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.examForm.valid) {
      const payload = {
        ...this.examForm.value,
        academicSessionId: this.activeSessionId // Backend needs this
      };
      this.dialogRef.close(payload);
    } else {
      this.examForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}