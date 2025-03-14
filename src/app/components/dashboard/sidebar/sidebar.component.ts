import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../../models/menu-item.interface';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SidebarComponent {
  @Input() currentUser: User | null = null;

  private menuItems: MenuItem[] = [
    {
      label: 'Mes Rendez-vous',
      icon: 'fas fa-calendar-alt',
      route: '/BO/appointments',
      roles: ['CLIENT'],
    },
    {
      label: 'Mes demandes',
      icon: 'fa-solid fa-paper-plane',
      route: '/BO/mes-demandes',
      roles: ['CLIENT'],
    },
    {
      label: 'Historique',
      icon: 'fas fa-history',
      route: '/BO/history',
      roles: ['CLIENT'],
    },
    // Éléments spécifiques aux mécaniciens
    {
      label: 'Planning',
      icon: 'fas fa-calendar-check',
      route: '/BO/schedule',
      roles: ['MECANICIEN'],
    },
    {
      label: 'Tâches',
      icon: 'fas fa-tasks',
      route: '/BO/tasks',
      roles: ['MECANICIEN'],
    },
    // Éléments spécifiques aux managers
    {
      label: 'Gestion Services',
      icon: 'fas fa-cogs',
      route: '/BO/services',
      roles: ['MANAGER'],
    },
    {
      label: 'Gestion Équipe',
      icon: 'fas fa-users',
      route: '/BO/team',
      roles: ['MANAGER'],
    },
    {
      label: 'Statistiques',
      icon: 'fas fa-chart-bar',
      route: '/BO/stats',
      roles: ['MANAGER'],
    },
  ];

  constructor(private authService: AuthService) {}

  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter((item) =>
      item.roles.includes(this.currentUser?.role || '')
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
