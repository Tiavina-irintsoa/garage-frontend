import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable, filter } from 'rxjs';

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
  styleUrls: ['./user-navbar.component.css'],
})
export class UserNavbarComponent implements OnInit {
  isExpanded = false;
  isUserMenuOpen = false;
  currentUser$: Observable<any>;
  darkMode = false;

  navItems: NavItem[] = [
    {
      icon: 'fas fa-calendar',
      label: 'Calendar',
      route: '/calendar',
      active: false,
    },
    {
      icon: 'fas fa-chart-bar',
      label: 'Analytics',
      route: '/analytics',
      active: false,
    },
    {
      icon: 'fas fa-folder',
      label: 'Projects',
      route: '/BO/kanban',
      active: false,
    },
    {
      icon: 'fas fa-tools',
      label: 'Mes demandes',
      route: '/BO/mes-demandes',
      active: false,
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;

    // S'abonner aux événements de navigation pour mettre à jour l'état actif
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveState();
      });
  }

  ngOnInit(): void {
    // Initialiser l'état actif au démarrage
    this.updateActiveState();
  }

  private updateActiveState(): void {
    const currentUrl = this.router.url;
    this.navItems = this.navItems.map((item) => ({
      ...item,
      active: currentUrl.startsWith(item.route),
    }));
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

  // Méthode utilitaire pour obtenir les classes CSS en fonction de l'état actif
  getItemClasses(item: NavItem): string {
    return `nav-item ${
      item.active ? 'active' : ''
    } hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200`;
  }
}
