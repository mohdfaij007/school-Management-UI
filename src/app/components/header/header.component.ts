import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { filter, Subject, takeUntil } from 'rxjs';

export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username = '';
  currentUser: any;
  isSidebarOpen = true;
  expandedItem: MenuItem | null = null;
  private destroy$ = new Subject<void>();

  constructor(private storageService: StorageService, public router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkLoginStatus();
      this.setActiveMenu();
    });
  }

  // --- Enriched Menu Data with Material Icons ---
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    {
      label: 'Students', icon: 'people',
      children: [{ label: 'Student Profile', route: '/search-student' }]
    },
    {
      label: 'Admission', icon: 'how_to_reg',
      children: [
        { label: 'New Admission', route: '/admission1' },
        { label: 'Enquiry', route: '/admission1' },
        { label: 'Promotion', route: '/promotion' }
      ]
    },
    {
      label: 'Masters', icon: 'account_tree',
      children: [
        { label: 'Add Sessions, Class & Sections', route: 'master/master-settings' },
        { label: 'Mapping of Classes', route: 'master/session-setup' },
        {label: 'Academic Calender', route: 'master/academic-calender'},
        
      ]
    },
    {
      label: 'Attendance', icon: 'event_available',
      children: [
        { label: 'Daily Attendance', route: '/attendance-report' },
        { label: 'Mark Attendance', route: '/mark-attendance' },
        {label: 'Monthly Register', route: '/attendance/monthly-register'},
      ]
    },
    {
      label: 'Fees Management', icon: 'payments',
      children: [
        { label: 'Fees Head', route: '/fees/head' },
        { label: 'Fees Mapping', route: '/fees/structure' },
        { label: 'Student Fee Mapping', route: '/fees/mapping' },
        { label: 'Receipts', route: '/fees/collection' }
      ]
    },
    {
      label: 'Staff Management', icon: 'badge',
      children: [
        { label: 'Teacher Profile', route: '/staff/profile' },
        { label: 'Payroll', route: '/staff/payroll' }
      ]
    },
    {
      label: 'Examination', icon: 'quiz',
      children: [
        { label: 'Time Table', route: 'masters/exam' },
        { label: 'Marks Entry', route: 'exam/marks-entry' },
        {label: 'Report Card', route: 'exam/report-card'}
      ]
    },
    {
      label: 'Transport', icon: 'directions_bus',
      children: [
        { label: 'Bus Route', route: '/exam/timetable' },
        { label: 'Transport Details', route: '/exam/reports' },
        { label: 'Transport Expenses', route: '/transport/expanses' }
      ]
    },
    {
      label: 'Library', icon: 'local_library',
      children: [
        { label: 'Book List', route: '/exam/timetable' },
        { label: 'Issue/Return', route: '/exam/reports' }
      ]
    },
    {
      label: 'Communication', icon: 'forum',
      children: [
        { label: 'SMS/Whatsapp', route: '/exam/timetable' },
        { label: 'Reminders', route: '/exam/reports' },
        { label: 'Issued Notice', route: '/communication' }
      ]
    },
    {
      label: 'Reports', icon: 'bar_chart',
      children: [
        { label: 'Fees Defaulters', route: '/fees/defaulters' },
        { label: 'Daily Collection', route: '/fees/reports/daily' },
        { label: 'Head-wise Report', route: '/fees/reports/head-wise' }
      ]
    }
  ];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleMenu(item: MenuItem) {
    this.expandedItem = this.expandedItem === item ? null : item;
  }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = this.storageService.getUser();
      this.username = this.currentUser.username;
    } else {
      this.currentUser = null;
      this.username = '';
      this.isLoggedIn = false;
    }
  }

// Yeh function current URL check karega aur parent menu ko open karega
  setActiveMenu() {
    const currentUrl = this.router.url;
    
    // Loop through all menu items
    for (const item of this.menuItems) {
      if (item.children) {
        // Check if any child route matches the current active URL
        const hasActiveChild = item.children.some(child => 
          child.route && currentUrl.includes(child.route)
        );
        
        if (hasActiveChild) {
          this.expandedItem = item; // Open the parent accordion
          break; // Stop searching once found
        }
      } else if (item.route && currentUrl.includes(item.route)) {
        // Agar dashboard jaisa single item hai
        this.expandedItem = null;
      }
    }
  }

  logout(): void {
    this.storageService.clean();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}