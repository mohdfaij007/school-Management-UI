// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-add-student',
//   imports: [],
//   templateUrl: './add-student.component.html',
//   styleUrl: './add-student.component.scss'
// })
// export class AddStudentComponent {

// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Router,RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss']
})
export class AddStudentComponent {
  student = {
    firstName: '',
    lastName: '',
    admissionNumber: '',
    grade: '',
    contactPhone: ''
  };
  submitted = false;

  constructor(private studentService: StudentService, private router: Router) {}

  saveStudent(): void {
    const data = {
      firstName: this.student.firstName,
      lastName: this.student.lastName,
      admissionNumber: this.student.admissionNumber,
      grade: this.student.grade,
      contactPhone: this.student.contactPhone
    };

    this.studentService.create(data).subscribe({
      next: (res) => {
        console.log(res);
        this.submitted = true;
        // Optional: Redirect back to dashboard after 2 seconds
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (e) => console.error(e)
    });
  }

  newStudent(): void {
    this.submitted = false;
    this.student = {
      firstName: '',
      lastName: '',
      admissionNumber: '',
      grade: '',
      contactPhone: ''
    };
  }
}