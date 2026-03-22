import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // NAYA IMPORT

import { MasterService } from '../../../services/master.service';

@Component({
  selector: 'app-master-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTabsModule, MatInputModule, 
    MatFormFieldModule, MatButtonModule, MatTableModule, 
    MatIconModule, MatSnackBarModule, MatDialogModule // YAHAN ADD KIYA
  ],
  templateUrl: './master-settings.component.html',
  styleUrl: './master-settings.component.scss'
})
export class MasterSettingsComponent implements OnInit {

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>; // Dialog Template Reference

  // Arrays for Table Data
  sessions: any[] = [];
  classes: any[] = [];
  sections: any[] = [];

  // Models for New Data Entry
  newSessionName: string = '';
  newStartDate: string = '';
  newEndDate: string = '';
  
  newClassName: string = '';
  newSectionName: string = '';

  displayedColumns: string[] = ['sno', 'name', 'action'];

  constructor(
    private masterService: MasterService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog // DIALOG INJECT KIYA
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.masterService.getAllSessions().subscribe(res => this.sessions = res);
    this.masterService.getAllStandards().subscribe(res => this.classes = res);
    this.masterService.getAllSections().subscribe(res => this.sections = res);
  }

  // --- SAVE METHODS ---

  saveSession() {
    if(!this.newSessionName || !this.newStartDate || !this.newEndDate) {
      this.snackBar.open('Please fill Session Name, Start Date, and End Date!', 'Close', { duration: 3000 });
      return;
    }
    const payload = { sessionName: this.newSessionName, startDate: this.newStartDate, endDate: this.newEndDate, isActive: false }; 
    
    this.masterService.addSession(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Session Added Successfully!', 'Close', { duration: 2000, panelClass: ['bg-success'] });
        this.newSessionName = ''; this.newStartDate = ''; this.newEndDate = '';
        this.loadAllData(); 
      },
      error: (err) => this.snackBar.open('Error saving session', 'Close', { duration: 2000 })
    });
  }

  saveClass() {
    if(!this.newClassName) return;
    const payload = { gradeName: this.newClassName }; 
    this.masterService.addStandard(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Class Added!', 'Close', { duration: 2000 });
        this.newClassName = ''; this.loadAllData();
      }
    });
  }

  saveSection() {
    if(!this.newSectionName) return;
    const payload = { sectionName: this.newSectionName }; 
    this.masterService.addSection(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Section Added!', 'Close', { duration: 2000 });
        this.newSectionName = ''; this.loadAllData();
      }
    });
  }

  // --- NAYA ENTERPRISE CONFIRMATION LOGIC ---

  markAsActive(id: number) {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      data: { 
        title: 'Change Active Session', 
        message: 'Are you sure? This will change the current working session of the entire school.',
        btnText: 'Set Active',
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.masterService.markSessionActive(id).subscribe({
          next: () => {
            this.snackBar.open('Active Session Changed!', 'Close', { duration: 2000, panelClass: ['bg-success'] });
            this.loadAllData();
          },
          error: (err) => this.snackBar.open('Failed to change session', 'Close', { duration: 3000 })
        });
      }
    });
  }

  deleteSession(id: number) {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      data: { title: 'Delete Session', message: 'Are you sure you want to delete this session? This action cannot be undone.', btnText: 'Delete', color: 'warn' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.masterService.deleteSession(id).subscribe({
          next: () => {
            this.snackBar.open('Session Deleted!', 'Close', { duration: 2000, panelClass: ['bg-danger'] });
            this.loadAllData();
          },
          error: (err) => this.snackBar.open('Cannot delete. It might be in use.', 'Close', { duration: 3000 })
        });
      }
    });
  }

  deleteClass(id: number) {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      data: { title: 'Delete Class', message: 'Are you sure you want to delete this class?', btnText: 'Delete', color: 'warn' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.masterService.deleteStandard(id).subscribe({
          next: () => {
            this.snackBar.open('Class Deleted!', 'Close', { duration: 2000, panelClass: ['bg-danger'] });
            this.loadAllData();
          },
          error: (err) => this.snackBar.open('Cannot delete. It might be in use.', 'Close', { duration: 3000 })
        });
      }
    });
  }

  deleteSection(id: number) {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      data: { title: 'Delete Section', message: 'Are you sure you want to delete this section?', btnText: 'Delete', color: 'warn' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.masterService.deleteSection(id).subscribe({
          next: () => {
            this.snackBar.open('Section Deleted!', 'Close', { duration: 2000, panelClass: ['bg-danger'] });
            this.loadAllData();
          },
          error: (err) => this.snackBar.open('Cannot delete. It might be in use.', 'Close', { duration: 3000 })
        });
      }
    });
  }
}