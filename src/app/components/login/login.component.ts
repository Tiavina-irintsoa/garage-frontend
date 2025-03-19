import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.auth.login(this.loginData).subscribe({
      next: (response) => {
        // Handle successful login
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        // Handle login error (show message to user)
      }
    });
  }

  onGoogleSignIn() {
    console.log('Initiating Google Sign In');
    this.auth.initiateGoogleLogin();
  }
} 