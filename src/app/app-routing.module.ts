import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';
import { KanbanComponent } from './kanban.component';

const routes: Routes = [
  { 
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  { 
    path: 'protected', 
    loadChildren: () => import('./protected/protected.module').then(m => m.ProtectedModule),
    canActivate: [authGuard]
  },
  { path: 'kanban', component: KanbanComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 