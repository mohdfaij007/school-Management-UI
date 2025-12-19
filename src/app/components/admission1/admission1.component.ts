import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { MasterService } from '../../services/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admission1',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admission1.component.html',
  styleUrls: ['./admission1.component.scss'] // Fixed typo: styleUrls (plural)
})
export class Admission1Component implements OnInit {

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  baseURL = 'http://localhost:8080/photos/'; // Matches your Backend WebConfig

  studentForm: FormGroup;
  isEditMode: boolean = false;
  currentStudentId: string | null = null;

  // Dropdown Lists
  sessions: any[] = [];
  standards: any[] = [];
  sections: any[] = [];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // 1. Initialize ALL fields here. No missing controls!
    this.studentForm = this.fb.group({
      // Academic
      academicSessionId: ['', Validators.required], // Use ID, not object
      admissionNumber: ['', Validators.required],
      standardId: ['', Validators.required],
      sectionId: ['', Validators.required],
      
      // Personal
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      contactPhone: ['', [Validators.pattern('^[0-9]{10}$')]],
      aadharNumber: [''],
      nationality: ['Indian'],
      email: ['', Validators.email],

      // Parents
      fatherName: ['', Validators.required],
      motherName: ['', Validators.required],
      fatherOccupation: [''],
      motherOccupation: [''],
      primaryMobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      secondaryMobile: [''],

      // Address
      currentAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      isAddressSame: [false], // Checkbox control
      permanentAddress: [''],

      // Previous School
      prevSchoolName: [''],
      lastClassPassed: [''],
      prevGrade: [''],
      tcNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadMasters();
    this.setupAddressLogic(); // Setup listeners

    this.currentStudentId = this.route.snapshot.paramMap.get('id');
    if (this.currentStudentId) {
      this.isEditMode = true;
      this.loadStudentData(this.currentStudentId);
    }
  }

  loadMasters(): void {
    // Use forkJoin to load all 3 APIs in parallel (Faster)
    forkJoin({
      sessions: this.masterService.getAllSessions(),
      standards: this.masterService.getAllStandards(),
      sections: this.masterService.getAllSections()
    }).subscribe({
      next: (result) => {
        this.sessions = result.sessions || [];
        this.standards = result.standards || [];
        this.sections = result.sections || [];

        // Set default session if adding new student
        if (!this.isEditMode) {
          const activeSession = this.sessions.find(s => s.isActive);
          if (activeSession) {
            this.studentForm.patchValue({ academicSessionId: activeSession.id });
          }
        }
      },
      error: (e) => console.error('Error loading masters', e)
    });
  }

  // Reactive Logic for Address (The Standard Way)
  setupAddressLogic(): void {
    // Watch for checkbox changes
    this.studentForm.get('isAddressSame')?.valueChanges.subscribe(isChecked => {
      const permControl = this.studentForm.get('permanentAddress');
      const currentAddr = this.studentForm.get('currentAddress')?.value;

      if (isChecked) {
        permControl?.setValue(currentAddr);
        permControl?.disable();
      } else {
        permControl?.enable();
        permControl?.setValue('');
      }
    });

    // Watch for Current Address typing IF checkbox is checked
    this.studentForm.get('currentAddress')?.valueChanges.subscribe(newVal => {
      if (this.studentForm.get('isAddressSame')?.value) {
        this.studentForm.get('permanentAddress')?.setValue(newVal, { emitEvent: false });
      }
    });
  }

  loadStudentData(id: string): void {
    this.studentService.get(id).subscribe({
      next: (data) => {
        // Flatten the data for the form
        this.studentForm.patchValue({
          ...data,
          standardId: data.standard?.id,
          sectionId: data.section?.id,
          academicSessionId: data.academicSession?.id,
          // Map other nested fields if necessary
        });
      if (data.profilePhoto) {
        this.imagePreview = this.baseURL + data.profilePhoto;
        console.log(this.imagePreview);
      }
    },
      error: (e) => console.error(e)
    });
  }

// 1. Method to handle file selection
onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
}







  saveStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched(); // Show validation errors
      return;
    }

    const formValue = this.studentForm.getRawValue(); // Get raw value to include disabled fields

    // Convert flat form data back to Objects for Backend
    const payload = {
      ...formValue,
      standard: { id: formValue.standardId },
      section: { id: formValue.sectionId },
      academicSession: { id: formValue.academicSessionId }
    };

    if (this.isEditMode) {
      this.studentService.update(this.currentStudentId, payload).subscribe({
        next: () => {
        // If there is a new file selected, upload it now
        if (this.selectedFile && this.currentStudentId) {
          this.studentService.uploadPhoto(this.currentStudentId, this.selectedFile).subscribe({
             next: () => this.handleSuccess('Updated'),
             error: () => this.snackBar.open('Data saved but photo failed', 'Close')
          });
        } else {
          this.handleSuccess('Updated');
        }
      },
        error: () => this.snackBar.open('Error updating', 'Close', { duration: 3000 })
      });
    } else {
      this.studentService.create(payload).subscribe({
        next: (newStudent: any) => { // Backend must return the created student object with ID
        if (this.selectedFile) {
           // Use the ID from response to upload photo
           this.studentService.uploadPhoto(newStudent.id, this.selectedFile).subscribe({
             next: () => this.handleSuccess('Created'),
             error: () => this.snackBar.open('Student created but photo failed', 'Close')
           });
        } else {
          this.handleSuccess('Created');
        }
      },
        error: () => this.snackBar.open('Error creating', 'Close', { duration: 3000 })
      });
    }
  }

  handleSuccess(action: string): void {
    this.snackBar.open(`Student ${action} Successfully!`, 'Close', { duration: 3000 });
    this.router.navigate(['/search-student']); // Redirect to search/list
  }
}