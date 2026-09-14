import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastContainerComponent } from '../../shared/components/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarComponent, 
    HeaderComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="app-layout-shell">
      <app-sidebar></app-sidebar>
      <div class="app-main-viewport">
        <app-header></app-header>
        <main class="app-content-container">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-layout-shell {
      display: flex;
      width: 100vw;
      min-height: 100vh;
      background-color: var(--df-background);
      overflow-x: hidden;
    }

    .app-main-viewport {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .app-content-container {
      flex: 1;
      padding: 2rem;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 900px) {
      .app-content-container {
        padding: 1.25rem;
      }
    }
  `]
})
export class MainLayoutComponent {}
