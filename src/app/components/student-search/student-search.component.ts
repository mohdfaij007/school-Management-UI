import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { MasterService } from '../../services/master.service';
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




@Component({
  selector: 'app-student-search',
  imports: [CommonModule, FormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatCardModule, MatSnackBarModule, MatIconModule],
  templateUrl: './student-search.component.html',
  styleUrl: './student-search.component.scss'
})
export class StudentSearchComponent implements OnInit{

  // Search Filters
  keyword: string = '';
  selectedStandard: string = ''; // ID for Class
  selectedSection: string = '';  // ID for Section

  // Table Data
  displayedColumns: string[] = ['admissionNumber', 'name', 'grade', 'section', 'contact', 'actions'];
  dataSource: any[] = [];

   // Pagination State
  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  // Data
  students: any[] = [];
  sections: any[] = [];
  standards: any[] = [];

  isLoading: boolean = false;
  message: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private studentService: StudentService, 
    private masterService: MasterService,
    private snackBar: MatSnackBar // For notifications
  ) { }

  ngOnInit(): void {
    // Optional: Load all students on start, or keep empty
    this.searchStudents(); 
    this.loadMasters();
  }
loadMasters(): void {
    this.masterService.getAllStandards().subscribe(data => this.standards = data);
    this.masterService.getAllSections().subscribe(data => this.sections = data);
  }
  searchStudents(): void {
   this.fetchData(this.pageIndex, this.pageSize);
  }


  // Actual API Call
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
    
// Handle Pagination Change (Next/Prev/Page Size)
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData(this.pageIndex, this.pageSize);
  }

   

  // Reset Filters
  clearSearch(): void {
    this.keyword = '';
    this.selectedStandard = '';
    this.selectedSection = '';
    this.pageIndex = 0;
    
    // Reset paginator UI if it exists
    if (this.paginator) {
      this.paginator.firstPage();
    }
    
    this.searchStudents();
  }

  showNotification(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }



}

