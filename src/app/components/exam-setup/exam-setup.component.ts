import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Angular Material Imports ---
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; // MatTableDataSource add karein
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; // Paginator module

// Material Imports

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Models
import { SubjectService } from '../../services/subject.service';
import { SubjectDTO } from '../../models/subject.model';
import { SubjectDialogComponent } from '../subject-dialog/subject-dialog.component';

import { GradeService } from '../../services/grade.service';
import { GradeMasterDTO } from '../../models/grade.model';
import { GradeDialogComponent } from '../grade-dialog/grade-dialog.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ExamDTO, ExamSubjectMappingDTO } from '../../models/exam.model';
import { ExamService } from '../../services/exam.service';
import { MasterService } from '../../services/master.service';
import { ExamDialogComponent } from '../exam-dialog/exam-dialog.component';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-exam-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatTabsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,     
    MatInputModule,      
    MatFormFieldModule,  
    MatDatepickerModule, 
    MatNativeDateModule,
    MatDividerModule
  ],
  templateUrl: './exam-setup.component.html',
  styleUrl: './exam-setup.component.scss'
})


 export class ExamSetupComponent implements OnInit {

  // Table Configuration
  displayedSubjectColumns: string[] = ['id', 'subjectName', 'subjectCode', 'subjectType', 'actions'];
  displayedGradeColumns: string[] = ['gradeName', 'range', 'gradePoint', 'remarks', 'actions']; // NAYA

  // 1. Array ki jagah DataSource use karein
  subjectDataSource = new MatTableDataSource<SubjectDTO>([]);
  gradeDataSource = new MatTableDataSource<GradeMasterDTO>([]);


  examList: ExamDTO[] = [];
  classList: any[] = [];
  
  selectedExamId: number | null = null;
  selectedClassId: number | null = null;

  timetableDataSource = new MatTableDataSource<ExamSubjectMappingDTO>([]);
  displayedTimetableColumns: string[] = ['subjectName', 'maxMarks', 'examDate', 'time', 'actions'];

  mappingForm: FormGroup; // Form to add subject to timetable

  // 2. HTML template se Paginator ko pakadne ke liye ViewChild
  @ViewChild('subjectPaginator') subjectPaginator!: MatPaginator;
  @ViewChild('gradePaginator') gradePaginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private subjectService: SubjectService,
    private gradeService: GradeService,
    private snackBar: MatSnackBar,
    private examService: ExamService,     
    private masterService: MasterService,
    private fb: FormBuilder,
  ) {
    this.mappingForm = this.fb.group({
      subjectId: ['', Validators.required],
      maxMarks: [100, [Validators.required, Validators.min(1)]],
      passingMarks: [33, [Validators.required, Validators.min(1)]],
      examDate: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['12:00', Validators.required]
    });
  }

  
  ngOnInit(): void {
    this.loadSubjects();
    this.loadGrades();
    this.loadExams();
    this.loadClasses();
  }

  loadExams() {
    this.examService.getAllExams().subscribe(data => this.examList = data);
  }

  loadClasses() {
    this.masterService.getAllClasses().subscribe(data => this.classList = data);
  } 

  // --- Subject Master Logic ---

 loadSubjects() {
    this.subjectService.getAllSubjects().subscribe({
      next: (data) => {
        // 3. Data assign karein aur paginator link karein
        this.subjectDataSource.data = data;
        
        // Paginator ko timeout mein rakhna safe hota hai taaki view render ho jaye
        setTimeout(() => {
          this.subjectDataSource.paginator = this.subjectPaginator;
        });
      },
      error: (err) => {
        this.showNotification('Error loading subjects!', 'error');
      }
    });
  }

  openSubjectDialog() {
    const dialogRef = this.dialog.open(SubjectDialogComponent, {
      width: '400px',
      disableClose: true // Forces user to click cancel/save
    });

    dialogRef.afterClosed().subscribe((result: SubjectDTO) => {
      if (result) {
        // If form was submitted, send to backend
        this.subjectService.createSubject(result).subscribe({
          next: (newSubject) => {
            this.showNotification('Subject Added Successfully!', 'success');
            this.loadSubjects(); // Refresh table
          },
          error: (err) => {
            this.showNotification(err.error || 'Failed to add subject', 'error');
          }
        });
      }
    });
  }

  loadGrades() {
    this.gradeService.getAllGrades().subscribe({
      next: (data) => {
        this.gradeDataSource.data = data;
        setTimeout(() => {
          this.gradeDataSource.paginator = this.gradePaginator;
        });
      },
      error: (err) => {
        this.showNotification('Error loading grades!', 'error');
      }
    });
  }

  openGradeDialog() {
    const dialogRef = this.dialog.open(GradeDialogComponent, {
      width: '450px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: GradeMasterDTO) => {
      if (result) {
        this.gradeService.createGrade(result).subscribe({
          next: (newGrade) => {
            this.showNotification('Grade Added Successfully!', 'success');
            this.loadGrades(); // Refresh table
          },
          error: (err) => {
            this.showNotification(err.error || 'Failed to add grade', 'error');
          }
        });
      }
    });
  }

  

  // Helper for Toast Notifications
  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['bg-success'] : ['bg-danger']
    });
  }


  openExamDialog() {
    const dialogRef = this.dialog.open(ExamDialogComponent, { width: '500px', disableClose: true });
    dialogRef.afterClosed().subscribe((result: ExamDTO) => {
      if (result) {
        this.examService.createExam(result).subscribe({
          next: (res) => {
            this.showNotification('Exam Created!', 'success');
            this.loadExams(); // Refresh exam dropdown
            this.selectedExamId = res.id!; // Auto-select naya exam
          },
          error: (err) => this.showNotification(err.error || 'Failed to create exam', 'error')
        });
      }
    });
  }

  // Jab Admin Dropdown se Exam ya Class change kare
  onSelectionChange() {
    if (this.selectedExamId && this.selectedClassId) {
      this.loadTimetable();
    } else {
      this.timetableDataSource.data = []; // Clear table agar dono select nahi hain
    }
  }

//  loadTimetable() {
//     this.examService.getExamSubjectsForClass(this.selectedExamId!, this.selectedClassId!).subscribe({
//       next: (data) => {
//         this.timetableDataSource.data = data;
//         console.log(data);// Data load ho jayega
//       },
//       error: (err) => {
//         console.error("Timetable load failed:", err);
//         // Ab agar backend fail hoga toh UI pe lal rang ka alert aayega
//         this.showNotification('Failed to load timetable!', 'error'); 
//       }
//     });
//   }


   loadTimetable() {
    this.examService.getExamSubjectsForClass(this.selectedExamId!, this.selectedClassId!).subscribe({
      next: (data) => {
        // Purana code: this.timetableDataSource.data = data; (Isme Angular UI refresh karna bhool jata hai)
        
        // NAYA CODE: Hum poora DataSource naya banayenge taaki Table majboor hokar dobara render ho
        this.timetableDataSource = new MatTableDataSource(data); 
        
      },
      error: (err) => {
        console.error("API Call Failed! Error details: ", err);
        this.showNotification('Failed to load timetable!', 'error'); 
      }
    });
  }

  addSubjectToTimetable() {
    if (this.mappingForm.invalid || !this.selectedExamId || !this.selectedClassId) {
      this.mappingForm.markAllAsTouched();
      return;
    }

    const formValue = this.mappingForm.value;
    
    // Format Date properly for backend (YYYY-MM-DD)
    const dateObj = new Date(formValue.examDate);
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    const payload: ExamSubjectMappingDTO = {
      examId: this.selectedExamId,
      standardId: this.selectedClassId,
      subjectId: formValue.subjectId,
      maxMarks: formValue.maxMarks,
      passingMarks: formValue.passingMarks,
      examDate: formattedDate,
      startTime: formValue.startTime + ":00", // Backend expects HH:mm:ss
      endTime: formValue.endTime + ":00"
    };

    this.examService.mapSubjectToExam(payload).subscribe({
      next: () => {
        this.showNotification('Subject mapped successfully!', 'success');
        this.loadTimetable(); // Table refresh karein
        this.mappingForm.reset({ maxMarks: 100, passingMarks: 33, startTime: '09:00', endTime: '12:00' }); // Form reset karein but defaults rakhein
      },
      error: (err) => this.showNotification(err.error || 'Failed to map subject', 'error')
    });
  }
}

