import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly router = inject(Router);

  readonly isMobileSidebarOpen = signal<boolean>(false);
  readonly isMobileSearchOpen = signal<boolean>(false);

  constructor() {
    // Automatically close mobile sidebar on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMobileSidebar();
      this.isMobileSearchOpen.set(false);
    });
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen.set(!this.isMobileSidebarOpen());
  }

  openMobileSidebar() {
    this.isMobileSidebarOpen.set(true);
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen.set(false);
  }

  toggleMobileSearch() {
    this.isMobileSearchOpen.set(!this.isMobileSearchOpen());
  }
}
