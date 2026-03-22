import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MasterService } from '../../../services/master.service';
import { MasterSetupService } from '../../../services/master-setup.service';
// Note: Ensure AttendanceService has getAttendanceDashboard() and markBulkAttendance()
import { AttendanceService } from '../../../services/attendance.service'; 

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatTableModule,
    MatIconModule, MatRadioModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './mark-attendance.component.html',
  styleUrl: './mark-attendance.component.scss'
})
export class MarkAttendanceComponent implements OnInit {

  // Filters
  sessionList: any[] = [];
  classList: any[] = [];
  sectionList: any[] = [];
  mappedSetups: any[] = [];

  activeSessionId: number | null = null;
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0]; // Default Today

  // Data
  studentsData: any[] = [];
  displayedColumns: string[] = ['sno', 'studentDetails', 'history', 'status', 'remarks'];
  isLoading: boolean = false;
  isSaving: boolean = false;

  constructor(
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMasters();
  }

  loadMasters() {
    this.masterService.getAllSessions().subscribe(data => {
      this.sessionList = data;
      const activeSession = data.find((s: any) => s.active);
      if (activeSession) {
        this.activeSessionId = activeSession.id;
        this.loadMappedClasses(activeSession.id);
      }
    });
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
    this.studentsData = [];
    if (this.selectedClassId) {
      this.sectionList = this.mappedSetups
        .filter((setup: any) => setup.standard.id == this.selectedClassId)
        .map((setup: any) => setup.section);
    }
  }

  loadAttendanceSheet() {
    if (!this.selectedClassId || !this.selectedSectionId || !this.activeSessionId || !this.selectedDate) {
      this.snackBar.open('Please select Class, Section, and Date.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.studentsData = [];  // clear old data

    // Aapke AttendanceServiceImpl me getAttendanceDashboard already hai
   this.attendanceService.getAttendanceDashboard(this.selectedClassId, this.selectedSectionId, this.activeSessionId, this.selectedDate)
      .subscribe({
        next: (data: any[]) => {
          this.studentsData = data.map(s => ({
            ...s,
            status: s.todayStatus || 'PRESENT',
            remarks: s.remarks || ''
          }));
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          // NAYA LOGIC: Check karega ki error plain text hai ya Spring Boot ka JSON object
          let errorMsg = 'Error loading student data.';
          if (typeof err.error === 'string') {
              errorMsg = err.error;
          } else if (err.error && err.error.message) {
              errorMsg = err.error.message;
          }
          
          // Clean message SnackBar mein dikhayega
          this.snackBar.open(errorMsg, 'Close', { duration: 5000, panelClass: ['bg-danger'] });
          this.isLoading = false;
        }
      });
  }

  saveAttendance() {
    if (this.studentsData.length === 0) return;
    this.isSaving = true;

    // Prepare payload matching BulkAttendanceRequest
    const payload = {
      standardId: this.selectedClassId,
      sectionId: this.selectedSectionId,
      academicSessionId: this.activeSessionId,
      date: this.selectedDate,
      students: this.studentsData.map(s => ({
        studentId: s.studentId,
        status: s.status,
        remarks: s.remarks
      }))
    };

    this.attendanceService.markBulkAttendance(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Attendance Saved Successfully!', 'Close', { duration: 3000, panelClass: ['bg-success'] });
        this.isSaving = false;
        this.loadAttendanceSheet(); // Reload to refresh history bubbles
      },
      error: (err) => {
        this.snackBar.open('Failed to save attendance.', 'Close', { duration: 3000, panelClass: ['bg-danger'] });
        this.isSaving = false;
      }
    });
  }

  // Helper for UI styling
  getHistoryColor(status: string): string {
    switch(status) {
      case 'P': return 'bubble-present';
      case 'A': return 'bubble-absent';
      case 'L': return 'bubble-late';
      case 'H': return 'bubble-halfday';
      default: return 'bubble-none';
    }
  }
}