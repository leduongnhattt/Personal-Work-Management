import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { SidebarService } from '../../../core/services/sidebar.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-sidenav',
    imports: [MatIconModule, CommonModule, RouterLink],
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.css',
    animations: [
        trigger('fadeInOut', [
            state('void', style({ opacity: 0 })),
            transition(':enter, :leave', [
                animate(300, style({ opacity: 1 })),
            ]),
        ]),
    ]
})
export class SidenavComponent {

  isSidebarVisible = true;
  isSubmenuOpen = false;
  isDashboardSelected = false;
  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarService.sidebarVisibility$.subscribe((isVisible) => {
      this.isSidebarVisible = isVisible;
    });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidebarService.toggleSidebar();
  }


  toggleSubmenu() {
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }


  selectDashboard() {
    this.isDashboardSelected = true;
  }
}
