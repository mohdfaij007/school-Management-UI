import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// MasterService jo pehle se hai
import { MasterService } from '../../../services/master.service'; 
// Nayi service mapping api call karne ke liye
import { MasterSetupService } from '../../../services/master-setup.service';


@Component({
  selector: 'app-session-setup',
  imports: [
    CommonModule, FormsModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatTableModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './session-setup.component.html',
  styleUrl: './session-setup.component.scss'
})
export class SessionSetupComponent implements OnInit{


  sessions: any[] = [];
  classes: any[] = [];
  sections: any[] = [];

  // Form Models
  selectedSessionId!: number;
  selectedClassId!: number;
  selectedSectionIds: number[] = [];
  maxCapacity: number = 40; // Default capacity

  // Table Data
  filterSessionId!: number;
  mappedData: any[] = [];
  displayedColumns: string[] = ['className', 'sectionName', 'maxCapacity', 'action'];

  constructor(
    private masterService: MasterService,
    private masterSetupService: MasterSetupService, 
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.masterService.getAllSessions().subscribe(res => {
      this.sessions = res;
      // Auto-select current active session in both form and filter
      const activeSession = res.find((s: any) => s.active === true);
      if (activeSession) {
        this.selectedSessionId = activeSession.id;
        this.filterSessionId = activeSession.id;
        this.loadTableData(); // Table mein data fetch karo
      }
    });
    this.masterService.getAllStandards().subscribe(res => this.classes = res);
    this.masterService.getAllSections().subscribe(res => this.sections = res);
  }

  loadTableData() {
    if (!this.filterSessionId) return;
    this.masterSetupService.getSetupBySession(this.filterSessionId).subscribe(res => {
      this.mappedData = res;
    });
  }

  saveMapping() {
    if (!this.selectedSessionId || !this.selectedClassId || this.selectedSectionIds.length === 0) {
      this.snackBar.open('Please select Session, Class, and at least one Section!', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      sessionId: this.selectedSessionId,
      standardId: this.selectedClassId,
      sectionIds: this.selectedSectionIds,
      maxCapacity: this.maxCapacity
    };

    this.masterSetupService.saveClassSectionMapping(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Mapping Saved Successfully!', 'Close', { duration: 3000, panelClass: ['bg-success'] });
        
        // Reset form slightly for next entry
        this.selectedClassId = null as any;
        this.selectedSectionIds = [];
        
        // Auto update table to show newly mapped items
        this.filterSessionId = this.selectedSessionId; 
        this.loadTableData();
      },
      error: (err) => this.snackBar.open('Error saving mapping', 'Close', { duration: 3000 })
    });
  }

  deleteMapping(id: number) {
    // API logic to delete a specific mapping
    console.log("Delete mapping with ID: ", id);
  }

}
