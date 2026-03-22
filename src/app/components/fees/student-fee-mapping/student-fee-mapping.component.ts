import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MasterService } from '../../../services/master.service';
import { MasterSetupService } from '../../../services/master-setup.service'; // NAYA IMPORT
import { StudentService } from '../../../services/student.service';
import { StudentFeeDialogComponent } from '../student-fee-dialog/student-fee-dialog.component';

@Component({
  selector: 'app-student-fee-mapping',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatTableModule, MatIconModule, MatDialogModule
  ],
  templateUrl: './student-fee-mapping.component.html',
  styleUrl: './student-fee-mapping.component.scss'
})
export class StudentFeeMappingComponent implements OnInit {

  sessions: any[] = [];
  classes: any[] = [];
  sections: any[] = [];
  students: any[] = [];
  mappedSetups: any[] = [];
  
  selectedSessionId: any;
  selectedClassId: any;
  selectedSectionId: any;

  loading: boolean = false;
  displayedColumns: string[] = ['admNo', 'name', 'father', 'actions'];

  constructor(
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private studentService: StudentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadFilters();
  }

  loadFilters() {
    this.masterService.getAllSessions().subscribe(data => {
      this.sessions = data;
      const active = this.sessions.find((s: any) => s.active);
      if (active) {
        this.selectedSessionId = active.id;
        this.loadMappedClasses(active.id);
      }
    });
  }

  onSessionChange() {
    this.selectedClassId = null;
    this.selectedSectionId = null;
    this.classes = [];
    this.sections = [];
    this.students = [];
    if(this.selectedSessionId) {
      this.loadMappedClasses(this.selectedSessionId);
    }
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
      this.classes = Array.from(uniqueClassesMap.values());
    });
  }

  onClassChange() {
    this.selectedSectionId = null;
    this.students = [];
    if (this.selectedClassId) {
      this.sections = this.mappedSetups
        .filter((setup: any) => setup.standard.id == this.selectedClassId)
        .map((setup: any) => setup.section);
    } else {
      this.sections = [];
    }
  }

  onSearch() {
    if (this.selectedClassId && this.selectedSectionId && this.selectedSessionId) {
      this.loading = true; 
      
      this.studentService.getStudentsByClass(this.selectedClassId, this.selectedSectionId, this.selectedSessionId)
        .subscribe({
          next: (data) => {
            this.students = data;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching students', err);
            this.loading = false;
          }
        });
    }
  }

  openFeeDialog(student: any) {
    this.dialog.open(StudentFeeDialogComponent, {
      width: '500px',
      data: {
        studentId: student.id,
        studentName: student.fullName || student.name, 
        classId: this.selectedClassId,
        sessionId: this.selectedSessionId
      }
    });
  }
}