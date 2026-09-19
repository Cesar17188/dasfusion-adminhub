import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'recuperar-password',
    redirectTo: 'forgot-password',
    pathMatch: 'full'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'update-password',
    redirectTo: 'reset-password',
    pathMatch: 'full'
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'kanban',
        loadComponent: () => import('./features/kanban/kanban-board.component').then(m => m.KanbanBoardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list.component').then(m => m.ProjectListComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/client-list.component').then(m => m.ClientListComponent)
      },
      {
        path: 'development',
        loadComponent: () => import('./features/development/dev-timeline.component').then(m => m.DevTimelineComponent)
      },
      {
        path: 'qa-testing',
        loadComponent: () => import('./features/qa-testing/qa-dashboard.component').then(m => m.QaDashboardComponent)
      },
      {
        path: 'deliveries',
        loadComponent: () => import('./features/deliveries/delivery-schedule.component').then(m => m.DeliveryScheduleComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/admin-users.component').then(m => m.AdminUsersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
