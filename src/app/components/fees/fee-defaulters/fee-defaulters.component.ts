import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeeService } from '../../../services/fee.service';
import { MasterService } from '../../../services/master.service';
import { MasterSetupService } from '../../../services/master-setup.service'; // NAYA IMPORT

@Component({
  selector: 'app-fee-defaulters',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatTableModule, MatIconModule,
    MatChipsModule, MatSnackBarModule
  ],
  templateUrl: './fee-defaulters.component.html',
  styleUrl: './fee-defaulters.component.scss'
})
export class FeeDefaultersComponent implements OnInit {
  
  activeSession: any = null;
  mappedSetups: any[] = [];
  classes: any[] = [];
  sections: any[] = [];

  selectedClassId: any;
  selectedSectionId: any;

  defaulterList: any[] = [];
  isLoading: boolean = false;
  displayedColumns: string[] = ['admNo', 'name', 'father', 'contact', 'due', 'action'];

  constructor(
    private feeService: FeeService,
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.masterService.getAllSessions().subscribe(sessions => {
      this.activeSession = sessions.find((s: any) => s.active === true);
      if (this.activeSession) {
        this.masterSetupService.getSetupBySession(this.activeSession.id).subscribe(setups => {
          this.mappedSetups = setups;
          this.extractUniqueClasses(setups);
        });
      } else {
        this.snackBar.open('No active session found!', 'Close', { duration: 3000 });
      }
    });
  }

  extractUniqueClasses(setups: any[]) {
    const uniqueClassesMap = new Map();
    setups.forEach(setup => {
      if (!uniqueClassesMap.has(setup.standard.id)) {
        uniqueClassesMap.set(setup.standard.id, setup.standard);
      }
    });
    this.classes = Array.from(uniqueClassesMap.values());
  }

  onClassChange(event: any) {
    const classId = event.value || event;
    this.selectedSectionId = null;
    this.defaulterList = [];
    if (classId) {
      this.sections = this.mappedSetups
        .filter(setup => setup.standard.id == classId)
        .map(setup => setup.section);
    } else {
      this.sections = [];
    }
  }

  fetchDefaulters() {
    if (!this.selectedClassId) {
      this.snackBar.open("Please select a class", "Ok", { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.feeService.getDefaulters(this.selectedClassId, this.selectedSectionId).subscribe({
      next: (data) => {
        this.defaulterList = data;
        this.isLoading = false;
        if(data.length === 0) {
            this.snackBar.open("No defaulters found! Good job.", "Ok", { duration: 3000, panelClass: ['bg-success'] });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open("Error fetching defaulters", "Close", { duration: 3000 });
      }
    });
  }

  sendReminder(element: any) {
    this.snackBar.open(`Reminder sent to ${element.contactNumber}`, 'Close', {duration: 2000});
  }
}