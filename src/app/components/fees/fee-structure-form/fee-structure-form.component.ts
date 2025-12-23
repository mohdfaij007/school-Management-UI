import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs'; // ⚡ Important for loading multiple lists

// Services

import Swal from 'sweetalert2';

// Material Imports
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FeeService } from '../../../services/fee.service';
import { MasterService } from '../../../services/master.service';


@Component({
  selector: 'app-fee-structure-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  templateUrl: './fee-structure-form.component.html',
  styleUrl: './fee-structure-form.component.scss'
})
export class FeeStructureFormComponent implements OnInit{

  structureForm: FormGroup;
  
  // Dropdown Lists
  sessions: any[] = [];
  classes: any[] = [];
  feeHeads: any[] = [];

  createAnother = false; // Checkbox state
  isEditMode = false;
  currentId: number | null = null;

constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private masterService: MasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.structureForm = this.fb.group({
      academicSessionId: ['', Validators.required],
      classId: ['', Validators.required],
      feeHeadId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      isMandatory: [true] // Default to TRUE (Checked)
    });
  }

ngOnInit(): void {
    this.loadDropdownData();

    // 2. Check if there is an ID in the URL (e.g. /edit/5)
    this.currentId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.currentId) {
      this.isEditMode = true;
      this.loadFeeStructureData(this.currentId);
    }
  }

  loadFeeStructureData(id: number) {
    // We wait for dropdowns to load first, otherwise setting values might fail
    this.feeService.getFeeStructureById(id).subscribe(data => {
      this.structureForm.patchValue({
        academicSessionId: data.academicSessionId,
        classId: data.classId,
        feeHeadId: data.feeHeadId,
        amount: data.amount
      });
    });
  }

  // ⚡ Load all dropdowns in parallel
  loadDropdownData() {
    forkJoin({
      sessions: this.masterService.getAllSessions(),
      classes: this.masterService.getAllStandards(),
      heads: this.feeService.getFeeHeads()
    }).subscribe({
      next: (result) => {
        console.log(result);
        this.sessions = result.sessions;

        this.classes = result.classes;
        this.feeHeads = result.heads;
        console.log(this.classes);
      },
      error: (err) => {
        console.error('Error loading dropdowns', err);
        Swal.fire('Error', 'Failed to load master data. Please try again.', 'error');
      }
    });
  }

  onSubmit() {
    if (this.structureForm.invalid) return;

    if (this.isEditMode && this.currentId) {
       // UPDATE LOGIC
       this.feeService.updateFeeStructure(this.currentId, this.structureForm.value).subscribe({
         next: () => {
           Swal.fire('Updated', 'Fee structure updated successfully', 'success');
           this.router.navigate(['/fees/structure']);
         },
         error: () => Swal.fire('Error', 'Update failed', 'error')
       });
    }
    else{
    this.feeService.createFeeStructure(this.structureForm.value).subscribe({
      next: () => {
        Swal.fire('Success', 'Fee Assigned Successfully!', 'success');
        
        if (this.createAnother) {
          // Keep Session and Class selected, just clear Fee Head and Amount
          // This helps when adding multiple fees (Tuition, Sports, Lab) for the SAME class
          this.structureForm.patchValue({
            feeHeadId: '',
            amount: ''
          });
          this.structureForm.markAsPristine();
        } else {
          this.router.navigate(['/fees/structure']);
        }
      },
      error: (err) => {
        Swal.fire('Error', 'Could not assign fee. It might already exist.', 'error');
      }
    });
  }
}

}
