import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Angular Material Imports
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { StudentService } from '../../services/student.service';
import { MasterService } from '../../services/master.service';
import { MasterSetupService } from '../../services/master-setup.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admission1',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatInputModule, MatSelectModule, MatFormFieldModule, 
    MatButtonModule, MatCardModule, MatDatepickerModule, 
    MatNativeDateModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './admission1.component.html',
  styleUrls: ['./admission1.component.scss'] 
})
export class Admission1Component implements OnInit {

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  

  studentForm: FormGroup;
  isEditMode: boolean = false;
  currentStudentId: string | null = null;

  activeSession: any = null;
  mappedSetups: any[] = []; 
  availableClasses: any[] = [];
  availableSections: any[] = [];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private masterService: MasterService,
    private masterSetupService: MasterSetupService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.studentForm = this.fb.group({
      sessionId: [{ value: '', disabled: true }, Validators.required], 
      admissionNumber: [{ value: '', disabled: true }], // Backend auto-generate karega, isliye disabled hai
      standardId: ['', Validators.required],
      sectionId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      contactPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fatherName: ['', Validators.required],
      motherName: [''],
      email: ['', Validators.email],
      aadharNumber: [''],
      primaryMobile: [''],
      secondaryMobile: [''],
      currentAddres: [''],
      city: [''],
      state: [''],
      pincode: [''],
      prevSchoolName: [''],
      lastClassPassed: [''],
      prevGrade: [''],
      tcNumber: ['']
    });
  }

  ngOnInit(): void {
    this.currentStudentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.currentStudentId;

    this.loadInitialData();
  }

  loadInitialData() {
    this.masterService.getAllSessions().subscribe(sessions => {
      this.activeSession = sessions.find((s: any) => s.active === true);
      
      if (this.activeSession) {
        this.studentForm.patchValue({ sessionId: this.activeSession.id });
        
        this.masterSetupService.getSetupBySession(this.activeSession.id).subscribe(setups => {
          this.mappedSetups = setups;
          this.extractUniqueClasses(setups);

          if (this.isEditMode) {
            this.loadStudentData();
          }
        });
      } else {
        this.snackBar.open('No active session found. Please set an active session first!', 'Close', { duration: 5000 });
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
    this.availableClasses = Array.from(uniqueClassesMap.values());
  }

  // UPDATED for Angular Material: 'event.value' use hoga
  onClassChange(event: any) {
    const classId = event.value || event; // handle both mat-select event and manual trigger
    this.studentForm.patchValue({ sectionId: '' }); 

    if (classId) {
      this.availableSections = this.mappedSetups
        .filter(setup => setup.standard.id == classId)
        .map(setup => setup.section);
    } else {
      this.availableSections = [];
    }
  }

  loadStudentData() {
    this.studentService.get(this.currentStudentId).subscribe(data => {
      if(data.standard && data.standard.id) {
         this.onClassChange(data.standard.id);
      }

      this.studentForm.patchValue({
        admissionNumber: data.admissionNumber,
        standardId: data.standard?.id,
        sectionId: data.section?.id,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        contactPhone: data.contactPhone,
        fatherName: data.fatherName,
        motherName: data.motherName,
        email: data.email,
        aadharNumber: data.aadharNumber,
        primaryMobile: data.primaryMobile,
        secondaryMobile: data.secondaryMobile,
        currentAddres: data.currentAddres,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        prevSchoolName: data.prevSchoolName,
        lastClassPassed: data.lastClassPassed,
        prevGrade: data.prevGrade,
        tcNumber: data.tcNumber
      });

      if (data.profilePhoto) {
        this.imagePreview = data.profilePhoto;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 2MB', 'Close', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveStudent() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields correctly!', 'Close', { duration: 3000 });
      return;
    }

    const formValues = this.studentForm.getRawValue(); 
    const payload = {
      ...formValues,
      schoolProfileId: 1 
    };

    if (this.isEditMode) {
      this.studentService.update(this.currentStudentId, payload).subscribe({
        next: () => {
          if (this.selectedFile && this.currentStudentId) {
            this.studentService.uploadPhoto(this.currentStudentId, this.selectedFile).subscribe({
               next: () => this.handleSuccess('Updated'),
               error: () => this.snackBar.open('Data saved but photo failed', 'Close')
            });
          } else {
            this.handleSuccess('Updated');
          }
        },
        error: () => this.snackBar.open('Error updating student', 'Close', { duration: 3000 })
      });
    } else {
      this.studentService.create(payload).subscribe({
        next: (newStudent: any) => {
          if (this.selectedFile) {
             this.studentService.uploadPhoto(newStudent.id, this.selectedFile).subscribe({
               next: () => this.handleSuccess('Created'),
               error: () => this.snackBar.open('Student created but photo failed', 'Close')
             });
          } else {
            this.handleSuccess('Created');
          }
        },
        error: () => this.snackBar.open('Error creating student', 'Close', { duration: 3000 })
      });
    }
  }

  handleSuccess(action: string): void {
    this.snackBar.open(`Student Successfully ${action}!`, 'Close', { duration: 3000, panelClass: ['bg-success'] });
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}