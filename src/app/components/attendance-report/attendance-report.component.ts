import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; 
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance-report',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.scss'
})
export class AttendanceReportComponent implements OnInit{
  selectedDate: string = new Date().toISOString().split('T')[0];
  attendanceRecords: any[] = [];
  isLoading = false;
  message = '';

  constructor(private attendanceService: AttendanceService) { }

  ngOnInit(): void {
    this.fetchAttendance();
  }

  fetchAttendance(): void {
    this.isLoading = true;
    this.message = '';
    this.attendanceRecords = [];

    this.attendanceService.getByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.attendanceRecords = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.message = 'No attendance records found for this date.';
        }
      },
      error: (e) => {
        console.error(e);
        this.isLoading = false;
        this.message = 'Error loading data.';
      }
    });
  }

}
