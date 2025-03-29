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
    { icon: 'fas fa-folder', label: 'Projects', route: '/BO/kanban' },
  ];

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
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

  onLogout(): void {
    this.authService.logout();
  }
}
