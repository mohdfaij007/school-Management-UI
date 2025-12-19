import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
@Component({
  selector: 'app-student-profile',
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatTabsModule, MatButtonModule,
    MatIconModule, MatListModule, MatDividerModule, MatChipsModule
  ],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss'
})
export class StudentProfileComponent implements OnInit{

  student: any = null;
  loading: boolean = true;
  imagePreview: string | ArrayBuffer | null = null;
  baseURL = 'http://localhost:8080/photos/'; // Matches your Backend WebConfig


  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(id);
    }
  }

  loadStudent(id: string): void {
    this.loading = true;
    this.studentService.get(id).subscribe({
      next: (data) => {
        this.student = data;
        
        this.loading = false;
        if(this.student.profilePhoto)
        {
            this.imagePreview=this.baseURL+this.student.profilePhoto;
            console.log(this.imagePreview);
        }
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      }
    });
  }

  printProfile(): void {
    window.print();
  }


}
