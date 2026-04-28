import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  metrics: any = null;
  defaulterColumns: string[] = ['name', 'class', 'dueAmount'];
  transactionColumns: string[] = ['date', 'amount', 'mode'];

  // --- CHART CONFIGURATIONS ---
  public barChartOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [65000, 59000, 80000, 81000, 56000, 55000], label: 'Monthly Revenue (₹)', backgroundColor: '#00b4d8' }]
  };

  public lineChartOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false };
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{ data: [92, 95, 94, 91, 98, 96], label: 'Attendance %', borderColor: '#2b9348', tension: 0.4 }]
  };

  ngOnInit(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        // Optionally update chart data dynamically here later!
      },
      error: (err) => console.error('Failed to load dashboard metrics', err)
    });
  }
}