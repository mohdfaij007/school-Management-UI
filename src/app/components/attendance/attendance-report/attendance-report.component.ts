import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { AttendanceService } from '../../../services/attendance.service';
import { MasterService } from '../../../services/master.service';
import { MasterSetupService } from '../../../services/master-setup.service';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatButtonModule, MatTableModule, MatIconModule
  ],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.scss'
})
export class AttendanceReportComponent implements OnInit {

  selectedDate: string = new Date().toISOString().split('T')[0];
  
  sessionList: any[] = [];
  classList: any[] = [];
  sectionList: any[] = [];
  mappedSetups: any[] = [];

  activeSessionId: number | null = null;
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;

  attendanceRecords: any[] = [];
  displayedColumns: string[] = ['admNo', 'name', 'status', 'remarks'];
  isLoading = false;
  message = '';

  constructor(
    private attendanceService: AttendanceService,
    private masterService: MasterService,
    private masterSetupService: MasterSetupService
  ) { }

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
      const uniqueMap = new Map();
      setups.forEach((setup: any) => {
        if (!uniqueMap.has(setup.standard.id)) uniqueMap.set(setup.standard.id, setup.standard);
      });
      this.classList = Array.from(uniqueMap.values());
    });
  }

  onClassChange() {
    this.sectionList = [];
    this.selectedSectionId = null;
    this.attendanceRecords = [];
    if (this.selectedClassId) {
      this.sectionList = this.mappedSetups
        .filter((setup: any) => setup.standard.id == this.selectedClassId)
        .map((setup: any) => setup.section);
    }
  }

  fetchAttendance(): void {
    if (!this.selectedClassId || !this.selectedSectionId || !this.selectedDate) {
      this.message = "Please select Class, Section and Date.";
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.attendanceRecords = [];

    this.attendanceService.getAttendanceForClass(this.selectedClassId, this.selectedSectionId, this.selectedDate).subscribe({
      next: (data) => {
        this.attendanceRecords = data || [];
        this.isLoading = false;
        if (this.attendanceRecords.length === 0) {
          this.message = 'No attendance recorded for this class on ' + this.selectedDate;
        }
      },
      error: (e) => {
        console.error(e);
        this.isLoading = false;
        this.message = 'Error loading attendance report.';
      }
    });
  }
}