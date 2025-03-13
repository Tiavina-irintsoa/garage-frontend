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
  template: `
    <aside class="h-screen w-64 fixed left-0 top-0 bg-blue-primary text-white">
      <!-- Logo -->
      <div class="p-4 border-b border-white/10">
        <a href="/" class="flex items-center space-x-2">
          <i class="fas fa-wrench text-2xl"></i>
          <span class="text-xl font-bold">Mon Garage</span>
        </a>
      </div>

      <!-- Menu Items -->
      <nav class="p-4">
        <ul class="space-y-2">
          <li *ngFor="let item of filteredMenuItems">
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/10"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <i [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- User Info & Logout -->
      <div
        class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10"
      >
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 rounded-full overflow-hidden">
            <img
              [src]="
                'https://api.dicebear.com/9.x/fun-emoji/svg?seed=' +
                currentUser?.email
              "
              [alt]="currentUser?.prenom"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <p class="font-medium">
              {{ currentUser?.prenom }} {{ currentUser?.nom }}
            </p>
            <p class="text-sm opacity-75">{{ currentUser?.role }}</p>
          </div>
        </div>
        <button
          (click)="logout()"
          class="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
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
    // Éléments communs à tous les rôles
    {
      label: 'Tableau de bord',
      icon: 'fas fa-home',
      route: '/dashboard',
      roles: ['CLIENT', 'MECANICIEN', 'MANAGER'],
    },
    // Éléments spécifiques aux clients
    {
      label: 'Mes Rendez-vous',
      icon: 'fas fa-calendar-alt',
      route: '/dashboard/appointments',
      roles: ['CLIENT'],
    },
    {
      label: 'Historique',
      icon: 'fas fa-history',
      route: '/dashboard/history',
      roles: ['CLIENT'],
    },
    // Éléments spécifiques aux mécaniciens
    {
      label: 'Planning',
      icon: 'fas fa-calendar-check',
      route: '/dashboard/schedule',
      roles: ['MECANICIEN'],
    },
    {
      label: 'Tâches',
      icon: 'fas fa-tasks',
      route: '/dashboard/tasks',
      roles: ['MECANICIEN'],
    },
    // Éléments spécifiques aux managers
    {
      label: 'Gestion Services',
      icon: 'fas fa-cogs',
      route: '/dashboard/services',
      roles: ['MANAGER'],
    },
    {
      label: 'Gestion Équipe',
      icon: 'fas fa-users',
      route: '/dashboard/team',
      roles: ['MANAGER'],
    },
    {
      label: 'Statistiques',
      icon: 'fas fa-chart-bar',
      route: '/dashboard/stats',
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
