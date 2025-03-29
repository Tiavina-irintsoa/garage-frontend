import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-navbar.component.html',
  styleUrls: ['./user-navbar.component.css']
})
export class UserNavbarComponent implements OnInit {
  isExpanded = false;
  isUserMenuOpen = false;
  currentUser$: Observable<any>;
  darkMode = false;

  navItems: NavItem[] = [
    { icon: 'fas fa-calendar', label: 'Calendar', route: '/calendar' },
    { icon: 'fas fa-chart-bar', label: 'Analytics', route: '/analytics' },
    { icon: 'fas fa-folder', label: 'Projects', route: '/projects' },
  ];

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    }
    
    // Check screen size on init
    this.checkScreenSize();
    
    // Listen for window resize
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  checkScreenSize(): void {
    this.isExpanded = window.innerWidth < 768;
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleTheme(): void {
    if (this.darkMode) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  enableDarkMode(): void {
    document.documentElement.classList.add('dark');
    this.darkMode = true;
    localStorage.setItem('theme', 'dark');
  }

  disableDarkMode(): void {
    document.documentElement.classList.remove('dark');
    this.darkMode = false;
    localStorage.setItem('theme', 'light');
  }

  onLogout(): void {
    this.authService.logout();
  }
}
