import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeeService } from '../../../services/fee.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
// Material Imports
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Added Checkbox
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-fee-head-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,       // Fixes ngModel error
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './fee-head-form.component.html',
  styleUrl: './fee-head-form.component.scss'
})
export class FeeHeadFormComponent implements OnInit{

  feeHeadForm: FormGroup;
  isEditMode = false;
  feeHeadId: number | null = null;
  createAnother = false; // Checkbox state
  frequencies = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY', 'ONE_TIME'];


  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private router: Router,
    private route: ActivatedRoute // To get the ID from URL
  ) {
    this.feeHeadForm = this.fb.group({
      headName: ['', Validators.required],
      description: [''],
      frequency: ['MONTHLY', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if URL has an ID (e.g. /edit/5)
    this.feeHeadId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.feeHeadId) {
      this.isEditMode = true;
      this.loadFeeHeadData(this.feeHeadId);
    }
  }


  loadFeeHeadData(id: number) {
    // We need a method in Service to get ONE fee head (I will add this below)
    // For now, assuming you can fetch it or filter from a list
    // this.feeService.getFeeHeadById(id).subscribe(data => this.feeHeadForm.patchValue(data));
  }



  onSubmit() {
    if (this.feeHeadForm.invalid) return;

    if (this.isEditMode) {
        // Handle Update Logic
        // this.feeService.updateFeeHead(this.feeHeadId, this.feeHeadForm.value)...
    } else {
      // Handle Create Logic
      this.feeService.createFeeHead(this.feeHeadForm.value).subscribe(
        () => {
          Swal.fire('Success', 'Fee Head Saved!', 'success');
          
          if (this.createAnother) {
            // Option A: Reset form and stay here
            this.feeHeadForm.reset({ frequency: 'MONTHLY' });
          } else {
            // Option B: Go back to list
            this.router.navigate(['/fees/head']);
          }
        },
        error => Swal.fire('Error', 'Could not save fee head', 'error')
      );
    }
  }
}
