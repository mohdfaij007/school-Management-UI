import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { filter } from 'rxjs';

// 1. Define the Interface here for simplicity
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
export class HeaderComponent implements OnInit{
isLoggedIn = false;
  username = '';
  currentUser: any;
    // --- State Variables ---
    isSidebarOpen = true;             // Master Switch: Is the whole sidebar visible?
    expandedItem: MenuItem | null = null; // Accordion Switch: Which menu item is expanded?

  constructor(private storageService: StorageService, private router: Router) {

     // Listen to route changes to update header visibility automatically
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     this.checkLoginStatus();
    //   }
    // });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLoginStatus();
    });
  }


  //  --- The Menu Data ---
    menuItems: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: '',
        route: '/dashboard',
      },
      {
        label: 'Students',
        icon: '',
        children: [
          { label: 'Student Profile', route: '/search-student' }
        ]
      },
      {
        label: 'Admission',
        icon: '',
        children: [
          { label: 'New Admisssion', route: '/admission' },
          { label: 'Enquiry', route: '/admission1' },
          {label:'Student Registation Status'}
        ]
      },
      {
        label: 'Classes',
        icon: '',
        children: [
          { label: 'Add Class', route: '/exam/timetable' },
          { label: 'Assign Class', route: '/exam/reports' }
        ]
      },
      {
        label: 'Attendance',
        icon: '',
        children: [
          { label: 'Daily Attendance', route: '/attendance-report' },
          { label: 'Monthly Report', route: '/attendance/monthly' },
          { label: 'Class-wise', route: '/attendance/class' }
        ]
      },
      {
        label: 'Fees Management',
        icon: '',
        children: [
          { label: 'Fees Head', route: '/fees/head' },
          { label: 'Fees Mapping', route: 'fees/structure' },
          { label: 'Receipts', route: '/fees/receipt' }
        ]
      },
      {
        label: 'Staff Management',
        icon: '',
        children: [
          { label: 'Teacher Profile', route: '/staff/profile' },
          { label: 'Payroll', route: '/staff/payroll' }
        ]
      },
      {
        label: 'Examination',
        icon: '',
        children: [
          { label: 'Time Table', route: '/exam/timetable' },
          { label: 'Report Cards', route: '/exam/reports' }
        ]
      },
      {
        label: 'Transport',
        icon: '',
        children: [
          { label: 'Bus Root', route: '/exam/timetable' },
          { label: 'Student Transport Details', route: '/exam/reports' },
          {label:'Transport Expanses',route:'transport/expanses'}
        ]
      },
      {
        label: 'Library',
        icon: '',
        children: [
          { label: 'Book List', route: '/exam/timetable' },
          { label: 'Issue/Return', route: '/exam/reports' }
        ]
      },
      {
        label: 'Communication',
        icon: '',
        children: [
          { label: 'SMS/Whatsapp', route: '/exam/timetable' },
          { label: 'Riminders', route: '/exam/reports' },
          {label:'Issued Notice',route:'/communication'}
        ]
      },
      {
        label: 'Reports',
        icon: '',
        children: [
          { label: 'Fees', route: '/exam/timetable' },
          { label: 'Attendance', route: '/exam/reports' },
          {label:'Exam'}
        ]
      },
  
      // Add the rest of your items (Transport, Library, etc.) here
    ];
  
    // --- Functions ---
  
    // 1. Toggles the whole sidebar (Hamburger button)
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
    // 2. Toggles the sub-menus (Accordion)
    toggleMenu(item: MenuItem) {
      if (this.expandedItem === item) {
        this.expandedItem = null; // Close if already open
      } else {
        this.expandedItem = item; // Open the new one
      }
    }
  
  

  ngOnInit(): void {
    // Check login status
    // this.isLoggedIn = this.storageService.isLoggedIn();
    // this.currentUser = this.storageService.getUser();
    // if (this.isLoggedIn) {
    //   const user = this.storageService.getUser();
    //   this.username = user.username;
    // }

     this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = this.storageService.isLoggedIn();
// console.log(this.isLoggedIn);
    if (this.isLoggedIn) {
      this.currentUser = this.storageService.getUser();
      this.username = this.currentUser.username;
    // console.log(this.username);  
    } else {
      this.currentUser = null;
      this.username = '';
      this.isLoggedIn = false;
    }
  }


  logout(): void {
    this.storageService.clean();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
