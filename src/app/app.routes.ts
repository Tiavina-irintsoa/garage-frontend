import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MesDemandesComponent } from './components/dashboard/demandes/mes-demandes/mes-demandes.component';
import { NouvelleDemandComponent } from './components/dashboard/demandes/nouvelle-demande/nouvelle-demande.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    pathMatch: 'full',
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
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
    children: [
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
            component: MesDemandesComponent,
          },
          {
            path: 'nouvelle-demande',
            component: NouvelleDemandComponent,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
