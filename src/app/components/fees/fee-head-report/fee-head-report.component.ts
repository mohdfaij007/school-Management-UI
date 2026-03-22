import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FeeService } from '../../../services/fee.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';



@Component({
  selector: 'app-fee-head-report',
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule,BaseChartDirective],
  templateUrl: './fee-head-report.component.html',
  styleUrl: './fee-head-report.component.scss'
})
export class FeeHeadReportComponent {

  reportData: any[] = [];
  displayedColumns: string[] = ['head', 'amount'];
  totalCollection: number = 0;

  // PIE CHART CONFIGURATION
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // 👈 KEY: Allows custom height/width
    plugins: {
      legend: {
        display: true,
        position: 'right', // Moves labels to the side (Cleaner look)
        labels: {
          font: {
            size: 12 // Makes text smaller and sharper
          },
          boxWidth: 15 // Makes the color boxes smaller
        }
      },
      title: {
        display: true,
        text: 'Fee Distribution', // Optional Title
        font: { size: 16 }
      }
    }
  };

  public pieChartType: ChartType = 'pie';
  
  // Initialize with empty data (will fill after API call)
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  
  // Assuming Session ID 1 is active. In real app, get this from AuthService/MasterService
  currentSessionId: number = 1; 

  constructor(private feeService: FeeService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.feeService.getHeadWiseReport(this.currentSessionId).subscribe(data => {
      this.reportData = data;
      // Calculate Grand Total
      this.totalCollection = data.reduce((sum, item) => sum + item.totalAmount, 0);


      // 👇 4. REAL-TIME DATA MAPPING
      // We map the API response to the Chart's format
      const labels = data.map(item => item.feeHeadName);  // ["Tuition", "Bus", "Exam"]
      const amounts = data.map(item => item.totalAmount); // [50000, 20000, 5000]

      this.pieChartData = {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: [ // Optional: Custom colors
            '#0D47A1', // Deep Blue
            '#42A5F5', // Light Blue
            '#26A69A', // Teal
            '#FFCA28', // Amber
            '#EF5350', // Red
            '#AB47BC'  // Purple
          ],
          hoverOffset: 4
        }]
      };
    });
  }

  printReport() {
    window.print();
  }

}
