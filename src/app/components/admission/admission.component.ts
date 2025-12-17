import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
// import { FormBuilder,FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admission',
  imports: [CommonModule,RouterModule,ReactiveFormsModule],
  templateUrl: './admission.component.html',
  styleUrl: './admission.component.scss'
})
export class AdmissionComponent implements OnInit{

  admissionForm: FormGroup;

  // // Mock Data for Dropdowns (In real app, fetch these from your API)
  // classes = ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
  // busRoutes = ['Route A - City Center', 'Route B - North Extension', 'Route C - Highway'];
  // bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // constructor(private fb: FormBuilder) {
  //   // Initialize the form with empty fields and validators
  //   this.admissionForm = this.fb.group({
      
  //     // SECTION 1: Student Details
  //     studentDetails: this.fb.group({
  //       firstName: ['', Validators.required],
  //       lastName: ['', Validators.required],
  //       dob: ['', Validators.required],
  //       gender: ['Male', Validators.required],
  //       bloodGroup: [''],
  //       nationality: ['Indian', Validators.required],
  //       category: ['General'], // e.g. General, OBC, SC/ST
  //       admissionClass: ['', Validators.required], // Class applying for
  //     }),

  //     // SECTION 2: Contact Information
  //     contactDetails: this.fb.group({
  //       address: ['', Validators.required],
  //       city: ['', Validators.required],
  //       pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
  //       mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  //       email: ['', [Validators.email]]
  //     }),

  //     // SECTION 3: Parent / Guardian Details
  //     parentDetails: this.fb.group({
  //       fatherName: ['', Validators.required],
  //       fatherOccupation: [''],
  //       motherName: ['', Validators.required],
  //       motherOccupation: [''],
  //       annualIncome: ['']
  //     }),

  //     // SECTION 4: Transport & Previous History
  //     otherDetails: this.fb.group({
  //       transportRequired: [false],
  //       busRoute: [''], // Only required if transportRequired is true
  //       previousSchool: [''],
  //       previousPercentage: ['']
  //     })
  //   });
  // }

  // ngOnInit(): void {
  //   // Optional: Listen to changes in Transport toggle to validate Route
  //   this.admissionForm.get('otherDetails.transportRequired')?.valueChanges
  //     .subscribe(isChecked => {
  //       const routeControl = this.admissionForm.get('otherDetails.busRoute');
  //       if (isChecked) {
  //         routeControl?.setValidators(Validators.required);
  //       } else {
  //         routeControl?.clearValidators();
  //       }
  //       routeControl?.updateValueAndValidity();
  //     });
  // }

  // onSubmit() {
  //   if (this.admissionForm.valid) {
  //     console.log('Form Submitted:', this.admissionForm.value);
  //     alert('Student Registered Successfully!');
  //     // Here you would call your Service: this.studentService.create(this.admissionForm.value)
  //   } else {
  //     // Mark all fields as touched to show error messages
  //     this.admissionForm.markAllAsTouched();
  //     alert('Please fill in all valid fields.');
  //   }
  // }


currentStep = 1; // Tracks the current step of the wizard

  // Mock Data (Replace with APIs later)
  classes = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  categories =['Genral','OBC','ST/SC','Other'];
  transportRoutes =['Left','Right'];

  constructor(private fb: FormBuilder) {
    this.admissionForm = this.fb.group({
      // Step 1: Student Identity
      studentDetails: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        dob: ['', Validators.required],
        gender: ['Male', Validators.required],
        aadharNo: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
        nationality: ['Indian', Validators.required],
        religion: [''],
        category: ['General', Validators.required],
        admissionClass: ['', Validators.required]
      }),

      // Step 2: Parent & Guardian Info
      parentDetails: this.fb.group({
        fatherName: ['', Validators.required],
        fatherOccupation: [''],
        fatherMobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        motherName: ['', Validators.required],
        motherOccupation: [''],
        annualIncome: ['', Validators.required], // Crucial for RTE/EWS
        email: ['', [Validators.email]]
      }),

     siblingDetails: this.fb.group({
    siblings: this.fb.array([]) 
  }),

      // Step 3: Address & Transport
      addressDetails: this.fb.group({
        currentAddress: ['', Validators.required],
        city: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        isPermanentSame: [false],
        permanentAddress: [''],
        transportRequired: [false],
        busRoute: [''] // Conditionally required
      }),

      // Step 4: Documents & Previous History
      academicHistory: this.fb.group({
        previousSchool: [''],
        lastGrade: [''],
        percentage: [''],
        transferCertificateNo: ['']
      })

      // Dynamic Sibling Array
      // Correct Syntax
        
    });
  }

  ngOnInit(): void {
    // 1. Logic: If "Transport Required" is checked, "Bus Route" becomes mandatory
    const addressGroup = this.admissionForm.get('addressDetails');
    addressGroup?.get('transportRequired')?.valueChanges.subscribe(isChecked => {
      const routeControl = addressGroup.get('busRoute');
      if (isChecked) {
        routeControl?.setValidators(Validators.required);
      } else {
        routeControl?.clearValidators();
        routeControl?.setValue('');
      }
      routeControl?.updateValueAndValidity();
    });

    // 2. Logic: Copy Address
    addressGroup?.get('isPermanentSame')?.valueChanges.subscribe(isChecked => {
      if (isChecked) {
        const currentAddr = addressGroup.get('currentAddress')?.value;
        addressGroup.get('permanentAddress')?.setValue(currentAddr);
        addressGroup.get('permanentAddress')?.disable();
      } else {
        addressGroup.get('permanentAddress')?.enable();
        addressGroup.get('permanentAddress')?.setValue('');
      }
    });
  }

  // 1. Getter for easy access in HTML
  get siblings(): FormArray {
    return this.admissionForm.get('siblings') as FormArray;
  }

  // 2. Add a new sibling row
  addSibling() {
    const siblingGroup = this.fb.group({
      name: ['', Validators.required],
      class: ['', Validators.required],
      admissionNo: [''] // Crucial for linking accounts
    });
    this.siblings.push(siblingGroup);
  }

  // 3. Remove a sibling row
  removeSibling(index: number) {
    this.siblings.removeAt(index);
  }

  // --- Wizard Navigation ---
  nextStep() {
    // Optional: Validate current step before moving
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  onSubmit() {
    if (this.admissionForm.valid) {
      console.log('Full Submission Payload:', this.admissionForm.getRawValue());
      alert('Admission Form Submitted Successfully!');
    } else {
      this.admissionForm.markAllAsTouched();
      alert('Please complete all required fields (marked red).');
    }
  }

}
