import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AcademicCalendarService } from '../../../services/academic-calendar.service';
import { MasterService } from '../../../services/master.service';

@Component({
  selector: 'app-academic-calendar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatTooltipModule, MatDialogModule
  ],
  templateUrl: './academic-calendar.component.html',
  styleUrl: './academic-calendar.component.scss'
})
export class AcademicCalendarComponent implements OnInit {

  // Dialog Template References
  @ViewChild('holidayDialogTemplate') holidayDialogTemplate!: TemplateRef<any>;
  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<any>; // NAYA TEMPLATE

  // Session Data
  sessionList: any[] = [];
  activeSessionId: number | null = null;
  holidays: any[] = [];

  // Calendar Engine
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  daysInMonthGrid: any[] = [];

  // Forms Models
  singleHoliday = { date: '', description: '', holidayType: 'FESTIVAL' };
  vacationForm = { startDate: '', endDate: '', description: '', holidayType: 'VACATION' };
  
  // Add Dialog Model
  dialogDate: string = '';
  dialogHoliday = { description: '', holidayType: 'FESTIVAL' };

  // Confirm Dialog Model
  confirmMessage: string = '';
  pendingAction: string = '';
  pendingHolidayId: number | null = null;

  isProcessing = false;

  constructor(
    private masterService: MasterService,
    private calendarService: AcademicCalendarService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.masterService.getAllSessions().subscribe(data => {
      this.sessionList = data;
      const active = data.find((s: any) => s.active === true || s.isActive === true || s.status === 'ACTIVE');
      
      if (active) {
        this.activeSessionId = active.id;
      } else if (data.length > 0) {
        this.activeSessionId = data[0].id; 
      }
      
      this.fetchHolidays();
    });
  }

  fetchHolidays() {
    if (!this.activeSessionId) return;
    this.calendarService.getCalendarBySession(this.activeSessionId).subscribe(data => {
      this.holidays = data;
      this.generateCalendarGrid(); 
    });
  }

  // --- CALENDAR ENGINE ---
  generateCalendarGrid() {
    this.daysInMonthGrid = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      this.daysInMonthGrid.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      const dateString = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const holidayObj = this.holidays.find(h => h.date === dateString);
      
      this.daysInMonthGrid.push({
        dayNumber: i,
        dateString: dateString,
        isToday: dateString === this.currentDate.toISOString().split('T')[0],
        holiday: holidayObj || null
      });
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; } 
    else { this.currentMonth--; }
    this.generateCalendarGrid();
  }

  nextMonth() {
    if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; } 
    else { this.currentMonth++; }
    this.generateCalendarGrid();
  }

  // --- PREMIUM CONFIRMATION DIALOG LOGIC ---
  openConfirmDialog(actionType: string, message: string, id: number | null = null) {
    this.pendingAction = actionType;
    this.confirmMessage = message;
    this.pendingHolidayId = id;
    this.dialog.open(this.confirmDialogTemplate, { width: '400px', disableClose: true });
  }

  executeConfirmAction() {
    if (this.pendingAction === 'SUNDAYS') {
      this.executeMarkAllSundays();
    } else if (this.pendingAction === 'DELETE') {
      this.executeDeleteHoliday(this.pendingHolidayId!);
    }
  }

  // --- ADD HOLIDAY POP-UP LOGIC ---
  onDateClick(day: any) {
    if (!day) return; 

    if (day.holiday) {
      // Show Premium Delete Alert
      this.openConfirmDialog('DELETE', `Are you sure you want to delete '${day.holiday.description}'?`, day.holiday.id);
    } else {
      this.dialogDate = day.dateString;
      this.dialogHoliday = { description: '', holidayType: 'FESTIVAL' }; 
      this.dialog.open(this.holidayDialogTemplate, { width: '400px' });
    }
  }

  saveDialogHoliday() {
    const payload = {
      academicSessionId: this.activeSessionId,
      date: this.dialogDate,
      description: this.dialogHoliday.description,
      holidayType: this.dialogHoliday.holidayType
    };

    this.calendarService.addSingleHoliday(payload).subscribe({
      next: () => {
        this.snackBar.open('Holiday Added!', 'Close', { duration: 3000, panelClass: 'bg-success' });
        this.fetchHolidays();
        this.dialog.closeAll(); 
      },
      error: (err) => this.snackBar.open(err.error || 'Failed to add', 'Close', { duration: 3000 })
    });
  }

  // --- MAGIC ACTIONS EXECUTION ---
  markAllSundays() {
    // Trigger Premium Alert
    this.openConfirmDialog('SUNDAYS', 'This will mark all 52 Sundays in this session as Weekly Offs. Do you want to proceed?');
  }

  private executeMarkAllSundays() {
    this.isProcessing = true;
    this.calendarService.markAllSundays(this.activeSessionId!).subscribe({
      next: (res) => {
        this.snackBar.open(res, 'Close', { duration: 4000, panelClass: 'bg-success' });
        this.fetchHolidays();
        this.isProcessing = false;
        this.dialog.closeAll(); // Close alert
      },
      error: () => { 
        this.snackBar.open('Error marking Sundays', 'Close'); 
        this.isProcessing = false; 
        this.dialog.closeAll();
      }
    });
  }

  private executeDeleteHoliday(id: number) {
    this.isProcessing = true;
    this.calendarService.deleteHoliday(id).subscribe({
      next: () => {
        this.snackBar.open('Holiday Deleted Successfully', 'Close', {duration: 2000});
        this.fetchHolidays();
        this.isProcessing = false;
        this.dialog.closeAll(); // Close alert
      },
      error: () => {
        this.snackBar.open('Failed to delete', 'Close');
        this.isProcessing = false;
        this.dialog.closeAll();
      }
    });
  }

  markVacation() {
    if (!this.vacationForm.startDate || !this.vacationForm.endDate) return;
    this.isProcessing = true;
    const payload = { ...this.vacationForm, academicSessionId: this.activeSessionId };
    
    this.calendarService.markVacationRange(payload).subscribe({
      next: (res) => {
        this.snackBar.open(res, 'Close', { duration: 4000, panelClass: 'bg-success' });
        this.vacationForm = { startDate: '', endDate: '', description: '', holidayType: 'VACATION' };
        this.fetchHolidays();
        this.isProcessing = false;
      },
      error: (err) => { this.snackBar.open(err.error || 'Error marking vacation', 'Close'); this.isProcessing = false; }
    });
  }

  getHolidayClass(type: string) {
    if (type === 'NATIONAL_HOLIDAY') return 'type-national';
    if (type === 'WEEKEND') return 'type-weekend';
    if (type === 'VACATION') return 'type-vacation';
    if (type === 'EXAM') return 'type-exam';
    return 'type-festival';
  }
}