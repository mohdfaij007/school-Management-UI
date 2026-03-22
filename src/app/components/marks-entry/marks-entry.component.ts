import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { MasterService } from '../../services/master.service';
import { MasterSetupService } from '../../services/master-setup.service'; // NAYA IMPORT
import { ExamService } from '../../services/exam.service';
import { MarksService } from '../../services/marks.service';
import { StudentService } from '../../services/student.service'; // NAYA IMPORT
import { StudentMarksDTO } from '../../models/marks.model';
import { ExamSubjectMappingDTO } from '../../models/exam.model';

@Component({
  selector: 'app-marks-entry',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSelectModule, MatInputModule, 
    MatFormFieldModule, MatButtonModule, MatTableModule, 
    MatCheckboxModule, MatIconModule, MatSnackBarModule, MatDividerModule
  ],
  templateUrl: './marks-entry.component.html',
  styleUrl: './marks-entry.component.scss'
})
export class MarksEntryComponent implements OnInit {

  sessionList: any[] = [];
  examList: any[] = [];
  classList: any[] = [];
  sectionList: any[] = [];
  mappedSubjects: ExamSubjectMappingDTO[] = [];
  mappedSetups: any[] = [];

  activeSessionId: number | null = null;
  selectedExamId: number | null = null;
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  selectedMappingId: number | null = null; 

  gradingDataSource = new MatTableDataSource<StudentMarksDTO>([]);
  displayedColumns: string[] = ['sno', 'admissionNumber', 'studentName', 'marks', 'absent', 'remarks'];

  currentMaxMarks: number = 100;
  isSaving: boolean = false; 

  constructor(
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private examService: ExamService,
    private marksService: MarksService,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.masterService.getAllSessions().subscribe(data => {
      this.sessionList = data;
      const activeSession = data.find((s: any) => s.active);
      if (activeSession) {
        this.activeSessionId = activeSession.id;
        this.loadMappedClasses(activeSession.id);
      }
    });

    this.examService.getAllExams().subscribe(data => this.examList = data);
  }

  loadMappedClasses(sessionId: number) {
    this.masterSetupService.getSetupBySession(sessionId).subscribe(setups => {
      this.mappedSetups = setups;
      const uniqueClassesMap = new Map();
      setups.forEach((setup: any) => {
        if (!uniqueClassesMap.has(setup.standard.id)) {
          uniqueClassesMap.set(setup.standard.id, setup.standard);
        }
      });
      this.classList = Array.from(uniqueClassesMap.values());
    });
  }

  onSelectionChange() {
    this.sectionList = [];
    this.selectedSectionId = null;
    this.selectedMappingId = null;
    this.mappedSubjects = [];
    this.gradingDataSource.data = [];

    if (this.selectedClassId) {
      // 1. Load Sections for selected Class
      this.sectionList = this.mappedSetups
        .filter((setup: any) => setup.standard.id == this.selectedClassId)
        .map((setup: any) => setup.section);

      // 2. Load Subjects for Exam & Class
      if (this.selectedExamId) {
        this.examService.getExamSubjectsForClass(this.selectedExamId, this.selectedClassId).subscribe(data => {
          this.mappedSubjects = data;
        });
      }
    }
  }

  loadGradingSheet() {
    if (!this.selectedClassId || !this.selectedSectionId || !this.selectedMappingId || !this.activeSessionId) {
      this.showNotification('Please select all required fields', 'error');
      return;
    }

    const selectedMapping = this.mappedSubjects.find(m => m.id === this.selectedMappingId);
    if (selectedMapping) {
      this.currentMaxMarks = selectedMapping.maxMarks;
    }

    // 1. Fetch Students using Service (No hardcoded URL)
    this.studentService.getStudentsByClass(this.selectedClassId, this.selectedSectionId, this.activeSessionId)
      .subscribe({
        next: (students) => {
          // 2. Fetch Existing Marks from Database
          this.marksService.getMarksForMapping(this.selectedMappingId!).subscribe({
            next: (existingMarks) => {
              this.mergeData(students, existingMarks);
            }
          });
        },
        error: (err) => this.showNotification('Failed to load students', 'error')
      });
  }

  mergeData(students: any[], existingMarks: StudentMarksDTO[]) {
    const combinedData: StudentMarksDTO[] = students.map(student => {
      const existing = existingMarks.find(m => m.studentId === student.id);
      if (existing) {
        return existing; 
      } else {
        return {
          examSubjectMappingId: this.selectedMappingId!,
          studentId: student.id,
          studentName: student.fullName, 
          admissionNumber: student.admissionNo,
          marksObtained: null,
          isAbsent: false,
          remarks: ''
        };
      }
    });

    this.gradingDataSource = new MatTableDataSource(combinedData);
    this.cdr.detectChanges();
  }

  saveMarks() {
    const dataToSave = this.gradingDataSource.data;
    
    const invalidMark = dataToSave.find(m => m.marksObtained !== null && m.marksObtained > this.currentMaxMarks);
    if (invalidMark) {
      this.showNotification(`Marks cannot exceed ${this.currentMaxMarks} for ${invalidMark.studentName}`, 'error');
      return;
    }

    this.isSaving = true;

    this.marksService.saveBulkMarks(dataToSave).subscribe({
      next: (res) => {
        this.showNotification('Marks saved successfully!', 'success');
        this.isSaving = false; 
        this.loadGradingSheet(); 
      },
      error: (err) => {
        this.showNotification('Failed to save marks', 'error');
        this.isSaving = false;
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['bg-success'] : ['bg-danger']
    });
  }
}