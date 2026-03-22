import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FeeService } from '../../../services/fee.service';



@Component({
  selector: 'app-fee-daily-report',
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatDatepickerModule,
    MatNativeDateModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatTableModule, 
    MatIconModule
  ],
  templateUrl: './fee-daily-report.component.html',
  styleUrl: './fee-daily-report.component.scss'
})
export class FeeDailyReportComponent implements OnInit {

  selectedDate: Date = new Date(); // Default to today
  reportData: any = null;
  displayedColumns: string[] = ['id', 'time', 'mode', 'amount'];

  constructor(private feeService: FeeService) {}

  ngOnInit() {
    this.fetchReport();
  }

  fetchReport() {
    // Convert JS Date to YYYY-MM-DD string
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    
    this.feeService.getDailyReport(dateStr).subscribe(data => {
      this.reportData = data;
    });
  }

  printReport() {
    window.print();
  }

}
