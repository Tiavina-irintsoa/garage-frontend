import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable, filter, map } from 'rxjs';
import { User } from '../../../models/user.interface';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
  badge?: string;
  roles: string[];
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
  currentUser$: Observable<User | null>;
  darkMode = false;

  private navItems: NavItem[] = [
    // Éléments pour l'administrateur
    {
      icon: 'fas fa-chart-line',
      label: 'Dashboard',
      route: '/BO/admin/dashboard',
      active: false,
      roles: ['MANAGER'],
    },
    // Éléments pour les clients
    {
      icon: 'fas fa-calendar-alt',
      label: 'Mes Rendez-vous',
      route: '/BO/appointments',
      active: false,
      roles: ['CLIENT'],
    },
    {
      icon: 'fa-solid fa-paper-plane',
      label: 'Mes demandes',
      route: '/BO/mes-demandes',
      active: false,
      roles: ['CLIENT'],
    },
    {
      icon: 'fas fa-wrench',
      label: 'Services',
      route: '/BO/services',
      active: false,
      roles: ['CLIENT'],
    },
    {
      icon: 'fas fa-history',
      label: 'Historique',
      route: '/BO/history',
      active: false,
      roles: ['CLIENT'],
    },
    // Éléments pour les mécaniciens
    {
      icon: 'fas fa-calendar-check',
      label: 'Planning',
      route: '/BO/schedule',
      active: false,
      roles: ['MECANICIEN'],
    },
    {
      icon: 'fas fa-tasks',
      label: 'Tâches',
      route: '/BO/tasks',
      active: false,
      roles: ['MECANICIEN'],
    },
    // Éléments pour les managers
    {
      icon: 'fas fa-tools',
      label: 'Services',
      route: '/BO/services',
      active: false,
      roles: ['MANAGER'],
    },
    {
      icon: 'fas fa-industry',
      label: 'Marques',
      route: '/BO/marques',
      active: false,
      roles: ['MANAGER'],
    },
    {
      icon: 'fas fa-car-side',
      label: 'Modèles',
      route: '/BO/modeles',
      active: false,
      roles: ['MANAGER'],
    },

    {
      icon: 'fas fa-truck-monster',
      label: 'Types de véhicules',
      route: '/BO/types-vehicules',
      active: false,
      roles: ['MANAGER'],
    },
    {
      icon: 'fas fa-users',
      label: 'Gestion Équipe',
      route: '/BO/team',
      active: false,
      roles: ['MANAGER'],
    },
    {
      icon: 'fas fa-chart-bar',
      label: 'Statistiques',
      route: '/BO/stats',
      active: false,
      roles: ['MANAGER'],
    },
    {
      icon: 'fas fa-cogs',
      label: 'Pièces',
      route: '/BO/pieces',
      active: false,
      roles: ['MANAGER'],
    },
  ];

  filteredNavItems$: Observable<NavItem[]>;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;

    // Filtrer les éléments de navigation en fonction du rôle de l'utilisateur
    this.filteredNavItems$ = this.currentUser$.pipe(
      map((user) => {
        console.log('user role 2', user?.role);
        return this.navItems.filter((item) =>
          item.roles.includes(user?.role || '')
        );
      })
    );

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
    this.router.navigate(['/']);
  }

  // Méthode utilitaire pour obtenir les classes CSS en fonction de l'état actif
  getItemClasses(item: NavItem): string {
    return `nav-item ${
      item.active ? 'active' : ''
    } hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200`;
  }
}
