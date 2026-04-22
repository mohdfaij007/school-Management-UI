import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentService } from '../../services/student.service';


// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MasterService } from '../../services/master.service';

@Component({
  selector: 'app-student-promotion',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatTableModule
  ],
  templateUrl: './student-promotion.component.html',
  styleUrls: ['./student-promotion.component.scss']
})
export class StudentPromotionComponent implements OnInit {
  setupForm!: FormGroup;
  sessions: any[] = [];
  classes: any[] = [];
  sections: any[] = [];
  
  studentsList: any[] = [];
  displayedColumns: string[] = ['name', 'admissionNo', 'status', 'nextClass'];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private masterService: MasterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupForm = this.fb.group({
      currentSessionId: ['', Validators.required],
      currentClassId: ['', Validators.required],
      currentSectionId: [''],
      nextSessionId: ['', Validators.required],
      nextClassId: ['', Validators.required] // Default target class
    });

    this.loadDropdownData();
  }

  loadDropdownData() {
    // Replace these with your actual service calls to get dropdown data
    this.masterService.getAllSessions().subscribe(res => this.sessions = res);
    this.masterService.getAllClasses().subscribe(res => this.classes = res);
    this.masterService.getAllSections().subscribe(res => this.sections = res);
  }

  fetchStudents() {
    if (this.setupForm.invalid) {
      this.snackBar.open('Please select all required fields to fetch students', 'Close', { duration: 3000 });
      return;
    }

    const { currentClassId, currentSectionId, currentSessionId } = this.setupForm.value;

    // Fetch students based on current criteria
    this.studentService.getStudentsByClass(currentClassId, currentSectionId, currentSessionId)
      .subscribe({
        next: (data: any[]) => {
          // Map students to include our promotion grid controls
          this.studentsList = data.map(student => ({
            studentId: student.id,
            studentName: student.fullName,
            admissionNo: student.admissionNo,
            // Default everyone to 'PROMOTED'
            promotionStatus: 'PROMOTED', 
            // Default target class from the top filter
            nextClassId: this.setupForm.value.nextClassId 
          }));
        },
        error: (err) => this.snackBar.open('Error fetching students', 'Close', { duration: 3000 })
      });
  }

  submitBatchPromotion() {
    if (this.studentsList.length === 0) {
      this.snackBar.open('No students to promote!', 'Close', { duration: 3000 });
      return;
    }

    // Build the DTO exactly as Spring Boot expects it
    const payload = {
      currentSessionId: this.setupForm.value.currentSessionId,
      nextSessionId: this.setupForm.value.nextSessionId,
      students: this.studentsList.map(s => ({
        studentId: s.studentId,
        promotionStatus: s.promotionStatus,
        nextClassId: s.promotionStatus !== 'LEFT_SCHOOL' ? s.nextClassId : null,
        nextSectionId: null // Add section logic here if you want granular section targeting
      }))
    };

    this.studentService.promoteStudentsBatch(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open(res.message || 'Promotion successful!', 'Close', { duration: 5000 });
        this.studentsList = []; // Clear grid on success
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Promotion failed', 'Close', { duration: 5000 });
      }
    });
  }
}