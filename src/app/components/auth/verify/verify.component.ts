import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
})
export class VerifyComponent implements OnInit {
  verifyForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  email: string = '';
  showSuccessToast: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.verifyForm = this.fb.group({
      code: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];
      if (!this.email) {
        this.router.navigate(['/auth/register']);
      }
    });
  }

  onSubmit(): void {
    if (this.verifyForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const verifyData = {
        email: this.email,
        code: this.verifyForm.get('code')?.value,
      };

      this.authService.verifyEmail(verifyData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSuccessToast = true;

          // Fermer automatiquement le toast après 3 secondes
          setTimeout(() => {
            this.showSuccessToast = false;
          }, 3000);

          // Rediriger vers la page de connexion après un délai
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.error ||
            'Une erreur est survenue lors de la vérification';
        },
      });
    }
  }
}
