import { Component, OnInit, ViewChild } from '@angular/core';
// Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FeeService } from '../../../services/fee.service';
import { MasterService } from '../../../services/master.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-fee-structure',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './fee-structure.component.html',
  styleUrl: './fee-structure.component.scss'
})
export class FeeStructureComponent implements OnInit{

  // Filters
  sessions: any[] = [];
  classes: any[] = [];
  selectedSessionId: any;
  selectedClassId: any;

  // Table Data
  displayedColumns: string[] = ['id', 'className','feeHead', 'frequency', 'amount', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private feeService: FeeService,
    private masterService: MasterService
  ) { }

  ngOnInit(): void {
    this.loadFilters();
  }

  // Load Dropdowns for the Search Filter
  loadFilters() {
    forkJoin({
      sessions: this.masterService.getAllSessions(),
      classes: this.masterService.getAllStandards()
    }).subscribe({
      next: (result) => {
        this.sessions = result.sessions;
        this.classes = result.classes;

        // --- SMART AUTO-SELECTION LOGIC ---

        // 1. Auto-select Session
        // Try to find one marked 'isActive' or 'active', otherwise pick the first one
        const activeSession = this.sessions.find(s => s.isActive || s.active) || this.sessions[0];
        if (activeSession) {
          this.selectedSessionId = activeSession.id;

          // 2. LOAD DATA IMMEDIATELY (Based on Session Only)
          this.loadFeesBySessionOnly(this.selectedSessionId);
        }

        // 2. Auto-select First Class
        if (this.classes.length > 0) {
          this.selectedClassId = this.classes[0].id;
        }

        // 3. Auto-load Data (If we have both IDs selected)
        if (this.selectedSessionId && this.selectedClassId) {
          this.onSearch();
        }
      },
      error: (err) => console.error(err)
    });
  }


  // New method to load purely by session
  loadFeesBySessionOnly(sessionId: number) {
    this.feeService.getFeeStructuresBySession(sessionId).subscribe(data => {
      this.dataSource.data = data;
      console.log(this.dataSource);
      this.dataSource.paginator = this.paginator;
    });
  }

  // The Search Function
  onSearch() {
    if (this.selectedSessionId && this.selectedClassId) {
      this.feeService.getFeeStructures(this.selectedClassId, this.selectedSessionId)
        .subscribe({
          next: (data) => {
            this.dataSource.data = data;
            this.dataSource.paginator = this.paginator; // Re-attach paginator
          },
          error: (err) => console.error(err)
        });
    }

    else if (this.selectedClassId) {
      // If Class is selected, use the specific filter
      this.feeService.getFeeStructures(this.selectedClassId, this.selectedSessionId)
        .subscribe(data => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
        }
      );
    } else {
      // If NO Class is selected, show ALL for that session
      this.loadFeesBySessionOnly(this.selectedSessionId);
    }
  }

}
