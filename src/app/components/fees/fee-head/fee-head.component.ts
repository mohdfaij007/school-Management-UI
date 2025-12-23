import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeeService } from '../../../services/fee.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-fee-head',
  imports: [
   CommonModule,
    RouterModule, // Added RouterModule
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule
  ],
  templateUrl: './fee-head.component.html',
  styleUrl: './fee-head.component.scss'
})
export class FeeHeadComponent implements OnInit{
feeHeads: any[] = [];
  displayedColumns: string[] = ['id', 'headName', 'frequency', 'description', 'actions'];
// 1. Change simple array to MatTableDataSource
  dataSource = new MatTableDataSource<any>([]);

  // 2. Get a reference to the paginator in the HTML
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private feeService: FeeService) { }

  ngOnInit(): void {
    this.loadFeeHeads();
  }

  //    3. Link the paginator after the view loads
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  loadFeeHeads() {

    this.feeService.getFeeHeads().subscribe(
      (data) => {
            this.dataSource.data = data;
      },
      (error) => {
        console.error('Error fetching fee heads', error);
      }
    );
  }

}
