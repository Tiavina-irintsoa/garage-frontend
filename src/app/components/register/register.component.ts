import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.auth.register(this.registerData).subscribe({
      next: (response) => {
        // Handle successful registration
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        // Handle registration error (show message to user)
      }
    });
  }

  onGoogleSignIn() {
    console.log('Initiating Google Sign In from Register');
    this.auth.initiateGoogleLogin();
  }
} 