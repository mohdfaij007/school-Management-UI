import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MasterService } from '../../services/master.service';
import { MasterSetupService } from '../../services/master-setup.service'; // NAYA IMPORT
import { ExamService } from '../../services/exam.service';
import { ReportCardService } from '../../services/report-card.service';
import { StudentService } from '../../services/student.service'; // NAYA IMPORT
import { ReportCardDTO } from '../../models/report-card.model';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSelectModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatCardModule, MatSnackBarModule
  ],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.scss'
})
export class ReportCardComponent implements OnInit {

  sessionList: any[] = [];
  classList: any[] = [];
  sectionList: any[] = [];
  studentList: any[] = [];
  examList: any[] = [];
  mappedSetups: any[] = [];
  
  today = new Date();
  isDownloading: boolean = false;
  isLoading: boolean = false;

  activeSessionId: number | null = null;
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  selectedStudentId: number | null = null;
  selectedExamIds: number[] = []; 

  reportCardData: ReportCardDTO | null = null;

  constructor(
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private examService: ExamService,
    private reportCardService: ReportCardService,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMasters();
  }

  loadMasters() {
    this.masterService.getAllSessions().subscribe(data => {
      this.sessionList = data;
      const active = data.find((s:any) => s.active);
      if (active) {
        this.activeSessionId = active.id;
        this.loadMappedClasses(active.id);
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

  onClassChange() {
    this.sectionList = [];
    this.selectedSectionId = null;
    this.studentList = [];
    this.selectedStudentId = null;
    this.reportCardData = null;
    
    if (this.selectedClassId) {
      this.sectionList = this.mappedSetups
        .filter((setup: any) => setup.standard.id == this.selectedClassId)
        .map((setup: any) => setup.section);
    }
  }

  loadStudents() {
    this.selectedStudentId = null;
    this.reportCardData = null;
    this.selectedExamIds = [];
    this.studentList = [];

    if (this.selectedClassId && this.selectedSectionId && this.activeSessionId) {
      this.studentService.getStudentsByClass(this.selectedClassId, this.selectedSectionId, this.activeSessionId)
        .subscribe(data => {
          this.studentList = data;
        });
    }
  }

  onStudentChange() {
    this.reportCardData = null; 
    this.selectedExamIds = [];  
  }
  
  toggleExamSelection(examId: number) {
    const index = this.selectedExamIds.indexOf(examId);
    if (index === -1) {
      this.selectedExamIds.push(examId);
    } else {
      this.selectedExamIds.splice(index, 1);
    }
  }

  generateReport() {
    if (!this.selectedStudentId || this.selectedExamIds.length === 0 || !this.activeSessionId) {
      this.snackBar.open('Please select a student and at least one exam!', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.reportCardData = null; 

    this.reportCardService.generateReportCard(this.selectedStudentId, this.selectedExamIds, this.activeSessionId)
      .subscribe({
        next: (data) => {
          this.reportCardData = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Failed to generate report card', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  downloadPDF() {
    if (!this.selectedStudentId || this.selectedExamIds.length === 0 || !this.activeSessionId) return;

    this.isDownloading = true;

    this.reportCardService.downloadReportCardPdf(this.selectedStudentId, this.selectedExamIds, this.activeSessionId)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ReportCard_${this.selectedStudentId}.pdf`; 
          document.body.appendChild(a);
          a.click(); 
          
          window.URL.revokeObjectURL(url);
          a.remove();
          
          this.isDownloading = false;
          this.snackBar.open('PDF Downloaded Successfully!', 'Close', { duration: 3000, panelClass: ['bg-success'] });
        },
        error: (err) => {
          this.isDownloading = false;
          this.snackBar.open('Failed to download PDF. Check Console.', 'Close', { duration: 3000, panelClass: ['bg-danger'] });
        }
      });
  }
}