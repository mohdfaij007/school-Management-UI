import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule
import { StudentService } from '../../services/student.service';
import { MasterService } from '../../services/master.service'; // We need to create this!

@Component({
  selector: 'app-admission1',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admission1.component.html',
  styleUrl: './admission1.component.scss'
})
export class Admission1Component implements OnInit{

 // Flag for the checkbox
  isAddressSame: boolean = false;

  // Student Object with nested objects for Masters
  student: any = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    admissionNumber: '',
    contactPhone: '',
    standard: { id: '' },       // Initialize to avoid undefined errors
    section: { id: '' },
    academicSession: { id: '' },
    aadharNumber:'',
    // NEW ADDRESS FIELDS
    currentAddress: '',
    permanentAddress: '',
    city: '',
    state: '',
    pinCode: '',
  };

  // Lists for Dropdowns
  sessions: any[] = [];
  standards: any[] = [];
  sections: any[] = [];

  constructor(
    private studentService: StudentService,
    private masterService: MasterService, // Inject MasterService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMasters();
  }

  loadMasters(): void {
    // 1. Load Sessions
    this.masterService.getAllSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        // Auto-select the active session if available
        const activeSession = data.find((s: any) => s.isActive);
        if (activeSession) {
          this.student.academicSession.id = activeSession.id;
        }
      },
      error: (e) => console.error(e)
    });

    // 2. Load Standards (Classes)
    this.masterService.getAllStandards().subscribe({
      next: (data) => this.standards = data,
      error: (e) => console.error(e)
    });

    // 3. Load Sections
    this.masterService.getAllSections().subscribe({
      next: (data) => this.sections = data,
      error: (e) => console.error(e)
    });
  }

    // --- NEW LOGIC: Handle Address Copy ---
  onAddressCheckboxChange(): void {
    if (this.isAddressSame) {
      // If checked, copy current address to permanent address
      this.student.permanentAddress = this.student.currentAddress;
    } else {
      // If unchecked, you might want to clear it, or leave it editable
      this.student.permanentAddress = '';
    }
  }

  // Also update permanent address if user types in current address while checkbox is checked
  onCurrentAddressChange(): void {
    if (this.isAddressSame) {
      this.student.permanentAddress = this.student.currentAddress;
    }
  }
  saveStudent(): void {
    console.log("Submitting Student:", this.student);
    
    this.studentService.create(this.student).subscribe({
      next: (res) => {
        console.log("Student Created:", res);
        alert('Student Saved Successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        console.error(e);
        alert('Error saving student.');
      }
    });
  }



}
