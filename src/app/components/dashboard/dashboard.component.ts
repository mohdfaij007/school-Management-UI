import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for *ngFor
// import { StudentService } from '../../services/student.service';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';




@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  // students: any[] = [];
  
  constructor(
    // private studentService: StudentService,
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Check if user is logged in
    // this.currentUser = this.storageService.getUser();
    // if (!this.currentUser) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    // 2. Fetch Students
    // this.retrieveStudents();
  }

  // retrieveStudents(): void {
  //   this.studentService.getAll().subscribe({
  //     next: (data) => {
  //       this.students = data;
  //       console.log(data);
  //     },
  //     error: (e) => console.error(e)
  //   });
  // }

  logout(): void {
    this.storageService.clean();
    this.router.navigate(['/login']);
  }

}
