import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  currentUser$: Observable<User | null>;

  constructor(private router: Router, private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // La vérification de l'authentification se fait automatiquement dans le service
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onLogout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false; // Fermer le menu déroulant
    this.router.navigate(['/']);
  }
}
