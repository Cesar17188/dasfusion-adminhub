import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
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
        path: 'settings',
        loadComponent: () => import('./features/settings-supabase/supabase-settings.component').then(m => m.SupabaseSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
