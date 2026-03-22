import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { MasterService } from '../../services/master.service';
import { MasterSetupService } from '../../services/master-setup.service'; // NAYA IMPORT

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-student-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatCardModule, MatSnackBarModule, MatIconModule, MatTooltipModule
  ],
  templateUrl: './student-search.component.html',
  styleUrl: './student-search.component.scss'
})
export class StudentSearchComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Search Filters
  keyword: string = '';
  selectedStandard: string = '';
  selectedSection: string = '';

  // Dropdown Data
  standards: any[] = [];
  sections: any[] = [];
  mappedSetups: any[] = [];

  // Table Data
  dataSource: any[] = [];
  displayedColumns: string[] = ['photo', 'admissionNumber', 'name', 'class', 'section', 'contact', 'actions'];
  baseURL = 'http://localhost:8080/photos/';

  // Pagination
  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  constructor(
    private studentService: StudentService,
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadActiveSessionAndSetups();
    this.fetchData(this.pageIndex, this.pageSize);
  }

  loadActiveSessionAndSetups() {
    this.masterService.getAllSessions().subscribe(sessions => {
      const activeSession = sessions.find((s: any) => s.active === true);
      if (activeSession) {
        this.masterSetupService.getSetupBySession(activeSession.id).subscribe(setups => {
          this.mappedSetups = setups;
          this.extractUniqueClasses(setups);
        });
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
    this.standards = Array.from(uniqueClassesMap.values());
  }

  onClassChange(classId: any) {
    this.selectedSection = '';
    if (classId) {
      this.sections = this.mappedSetups
        .filter(setup => setup.standard.id == classId)
        .map(setup => setup.section);
    } else {
      this.sections = [];
    }
    this.searchStudents();
  }

  searchStudents(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.fetchData(this.pageIndex, this.pageSize);
  }

  fetchData(page: number, size: number): void {
    this.studentService.search(this.keyword, this.selectedStandard, this.selectedSection, page, size)
      .subscribe({
        next: (response) => {
          this.dataSource = response.content;
          this.totalElements = response.totalElements;

          if (this.dataSource.length === 0) {
            this.showNotification('No students found matching your criteria.', 'Info');
          }
        },
        error: (e) => {
          console.error(e);
          this.showNotification('Server Error: Could not fetch data.', 'Error');
        }
      });
  }

  // --- NAYA LOGIC: Enrollment array se active class/section nikalna ---
  getActiveClass(student: any): string {
    if (!student.enrollments) return '-';
    const activeEnrollment = student.enrollments.find((e: any) => e.currentActive === true || e.isCurrentActive === true);
    return activeEnrollment?.standard?.gradeName || '-';
  }

  getActiveSection(student: any): string {
    if (!student.enrollments) return '-';
    const activeEnrollment = student.enrollments.find((e: any) => e.currentActive === true || e.isCurrentActive === true);
    return activeEnrollment?.section?.sectionName || '-';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearSearch(): void {
    this.keyword = '';
    this.selectedStandard = '';
    this.selectedSection = '';
    this.sections = [];
    this.pageIndex = 0;

    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.fetchData(this.pageIndex, this.pageSize);
  }

  showNotification(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}