import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MasterService } from '../../../services/master.service';
import { MasterSetupService } from '../../../services/master-setup.service';
import { AttendanceService } from '../../../services/attendance.service';

@Component({
  selector: 'app-monthly-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './monthly-register.component.html',
  styleUrl: './monthly-register.component.scss'
})
export class MonthlyRegisterComponent implements OnInit {

  sessionList: any[] = [];
  classList: any[] = [];
  sectionList: any[] = [];
  mappedSetups: any[] = [];

  months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  
  years: number[] = [];

  activeSessionId: number | null = null;
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  isLoading = false;
  reportData: any = null;
  daysArray: number[] = [];

  constructor(
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {
    // Generate years (e.g., 2024 to 2030)
    const currentYear = new Date().getFullYear();
    for(let i = currentYear - 2; i <= currentYear + 3; i++) {
      this.years.push(i);
    }
  }

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
    this.reportData = null;
    if (this.selectedClassId) {
      this.sectionList = this.mappedSetups
        .filter((setup: any) => setup.standard.id == this.selectedClassId)
        .map((setup: any) => setup.section);
    }
  }

  fetchMonthlyRegister() {
    if (!this.selectedClassId || !this.selectedSectionId || !this.activeSessionId || !this.selectedMonth || !this.selectedYear) {
      this.snackBar.open('Please select all filters!', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.reportData = null;

    this.attendanceService.getMonthlyRegister(this.selectedClassId, this.selectedSectionId, this.activeSessionId, this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (data) => {
          this.reportData = data;
          // Generate an array of days [1, 2, 3, ... 31]
          this.daysArray = Array.from({length: data.daysInMonth}, (_, i) => i + 1);
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Failed to fetch data.', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  // Helper to print text in cell
  getCellText(day: number, student: any): string {
    if (this.reportData.holidayMap && this.reportData.holidayMap[day]) {
      return this.reportData.holidayMap[day]; // Returns 'W' or 'HO'
    }
    if (student.attendanceMap && student.attendanceMap[day]) {
      return student.attendanceMap[day]; // Returns 'P', 'A', 'L', 'H'
    }
    return '-'; // Not marked yet
  }

  // Helper to colorize cell
  getCellClass(day: number, student: any): string {
    if (this.reportData.holidayMap && this.reportData.holidayMap[day]) {
      return 'cell-holiday';
    }
    const status = student.attendanceMap ? student.attendanceMap[day] : null;
    if (status === 'P') return 'cell-present';
    if (status === 'A') return 'cell-absent';
    if (status === 'L') return 'cell-late';
    if (status === 'H') return 'cell-halfday';
    return 'cell-empty';
  }
}