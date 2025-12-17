import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { AdmissionComponent } from './components/admission/admission.component';
import { AttendanceReportComponent } from './components/attendance-report/attendance-report.component';
import { Admission1Component } from './components/admission1/admission1.component';
export const routes: Routes = [
    { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-student', component: AddStudentComponent },
  {path:'admission',component:AdmissionComponent},
  { path: 'attendance-report', component: AttendanceReportComponent },
  {path:'admission1',component:Admission1Component},
  { path: '', redirectTo: 'login', pathMatch: 'full' } // Default to login

];
