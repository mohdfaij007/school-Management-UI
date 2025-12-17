import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

form: any = {
    username: '',
    password: ''
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.router.navigate(['/dashboard']); // Redirect if already logged in
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: data => {
        // 1. Save token and user info
        this.storageService.saveUser(data);
        
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        
        // 2. Navigate to Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage = err.error.message || "Login Failed! Check credentials.";
        this.isLoginFailed = true;
      }
    });
  }

}
