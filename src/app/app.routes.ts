import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MesDemandesComponent } from './components/dashboard/demandes/mes-demandes/mes-demandes.component';
import { NouvelleDemandComponent } from './components/dashboard/demandes/nouvelle-demande/nouvelle-demande.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/shared/404/404.component';
import { BoLayoutComponent } from './layouts/bo-layout/bo-layout.component';
export const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./components/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./components/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'verify',
        loadComponent: () =>
          import('./components/auth/verify/verify.component').then(
            (m) => m.VerifyComponent
          ),
      },
    ],
  },
  {
    path: 'BO',
    component: BoLayoutComponent,
    //TODO: add auth guard
    //canActivate: [authGuard],
    children: [
      
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./components/dashboard/overview/overview.component').then(
            (m) => m.OverviewComponent
          ),
      },
      {
        path: 'mes-demandes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/dashboard/demandes/mes-demandes/mes-demandes.component').then(
                (m) => m.MesDemandesComponent
              ),
          },
          {
            path: 'nouvelle-demande',
            loadComponent: () =>
              import('./components/dashboard/demandes/nouvelle-demande/nouvelle-demande.component').then(
                (m) => m.NouvelleDemandComponent
              ),
          },
        ],
      },
      {
        path: 'kanban',
        loadComponent: () =>
          import('./components/kanban/kanban.component').then(
            (m) => m.KanbanComponent
          ),
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
