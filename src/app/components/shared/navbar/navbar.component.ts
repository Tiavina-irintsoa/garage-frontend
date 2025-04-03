import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  currentUser$: Observable<User | null>;

  private readonly USER_ROLE: UserRole = UserRole.CLIENT;
  private readonly ADMIN_ROLE: UserRole = UserRole.MANAGER;
  private readonly MANAGER_ROLE: UserRole = UserRole.MANAGER;

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

  goToBO(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    switch (user.role) {
      case this.USER_ROLE:
        this.router.navigate(['/BO/mes-demandes']);
        break;
      case this.ADMIN_ROLE:
        this.router.navigate(['/BO/services']);
        break;
      case this.MANAGER_ROLE:
        this.router.navigate(['/BO/dashboard']);
        break;
      default:
        this.router.navigate(['/BO/mes-demandes']); // Route par défaut
    }
  }
}
