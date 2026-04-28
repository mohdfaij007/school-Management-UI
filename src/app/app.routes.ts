import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';


import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { Admission1Component } from './components/admission1/admission1.component';
import { StudentSearchComponent } from './components/student-search/student-search.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';
import { FeeHeadComponent } from './components/fees/fee-head/fee-head.component';
import { FeeHeadFormComponent } from './components/fees/fee-head-form/fee-head-form.component';
import { FeeStructureFormComponent } from './components/fees/fee-structure-form/fee-structure-form.component';
import { FeeStructureComponent } from './components/fees/fee-structure/fee-structure.component';
import { StudentFeeMappingComponent } from './components/fees/student-fee-mapping/student-fee-mapping.component';
import { FeeCollectionComponent } from './components/fees/fee-collection/fee-collection.component';
import { FeeDefaultersComponent } from './components/fees/fee-defaulters/fee-defaulters.component';
import { FeeDailyReportComponent } from './components/fees/fee-daily-report/fee-daily-report.component';
import { FeeHeadReportComponent } from './components/fees/fee-head-report/fee-head-report.component';
import { ExamSetupComponent } from './components/exam-setup/exam-setup.component';
import { MarksEntryComponent } from './components/marks-entry/marks-entry.component';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { MasterSettingsComponent } from './components/master/master-settings/master-settings.component';
import { SessionSetupComponent } from './components/master/session-setup/session-setup.component';
import { AttendanceReportComponent } from './components/attendance/attendance-report/attendance-report.component';
import { MarkAttendanceComponent } from './components/attendance/mark-attendance/mark-attendance.component';
import { AcademicCalendarComponent } from './components/master/academic-calendar/academic-calendar.component';
import { MonthlyRegisterComponent } from './components/attendance/monthly-register/monthly-register.component';
import { StudentPromotionComponent } from './components/student-promotion/student-promotion.component';




export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // ALL PROTECTED ROUTES
  {
    path: '',
    canActivate: [authGuard], // Every route inside here requires login
    children: [
      { path: 'dashboard', component: DashboardComponent },
      
      // Basic student routes (Maybe accessible to Admin, Teacher, and Student)
      { path: 'search-student', component: StudentSearchComponent },
      { path: 'dashboard/students/profile/:id', component: StudentProfileComponent },
      { path: 'attendance-report', component: AttendanceReportComponent },

      // RESTRICTED ROUTES: Only Admin and Teacher
      {
        path: '',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'TEACHER'] }, // <-- Students cannot access these!
        children: [
          { path: 'add-student', component: AddStudentComponent },
          { path: 'admission1', component: Admission1Component },
          { path: 'dashboard/students/edit/:id', component: Admission1Component },
          { path: 'mark-attendance', component: MarkAttendanceComponent },
          { path: 'attendance/monthly-register', component: MonthlyRegisterComponent },
          { path: 'exam/marks-entry', component: MarksEntryComponent },
          { path: 'exam/report-card', component: ReportCardComponent },
          {path: 'promotion', component: StudentPromotionComponent},
        ]
      },

      // SUPER RESTRICTED ROUTES: Only Admin
      {
        path: '',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }, // <-- Only Admins can touch Fees and Master Settings
        children: [
          { path: 'fees/head', component: FeeHeadComponent },
          { path: 'fees/head/add', component: FeeHeadFormComponent },
          { path: 'fees/head/edit/:id', component: FeeHeadFormComponent },
          { path: 'fees/structure/add', component: FeeStructureFormComponent },
          { path: 'fees/structure', component: FeeStructureComponent },
          { path: 'fees/structure/edit/:id', component: FeeStructureFormComponent },
          { path: 'fees/mapping', component: StudentFeeMappingComponent },
          { path: 'fees/collection', component: FeeCollectionComponent },
          { path: 'fees/defaulters', component: FeeDefaultersComponent },
          { path: 'fees/reports/daily', component: FeeDailyReportComponent },
          { path: 'fees/reports/head-wise', component: FeeHeadReportComponent },
          { path: 'masters/exam', component: ExamSetupComponent },
          { path: 'master/master-settings', component: MasterSettingsComponent },
          { path: 'master/session-setup', component: SessionSetupComponent },
          { path: 'master/academic-calender', component: AcademicCalendarComponent },
        ]
      }
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' } // Catch-all route
];
