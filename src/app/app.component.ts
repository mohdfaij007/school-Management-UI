import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { StorageService } from './services/storage.service';
import { filter } from 'rxjs';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms'; // Ensure this is here too

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    RouterOutlet,
    HeaderComponent,
    ReactiveFormsModule, 
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'school-admin-ui';
  isLoggedIn = false;



  constructor(private storageService: StorageService, private router: Router) {
    // Listen for route changes to update login status
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLoginStatus();
    });
  }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = this.storageService.isLoggedIn();
  }
}
