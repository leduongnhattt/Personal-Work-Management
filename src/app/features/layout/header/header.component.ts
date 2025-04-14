import { Component } from '@angular/core';
import { SidebarService } from '../../../core/services/sidebar.service';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatToolbarModule, CommonModule, RouterLink, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private sidebarService: SidebarService, private router: Router, private authService: AuthService, private toastr: ToastrService) { }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
  hideSidebar() {
    this.sidebarService.hideSidebar();
  }

  signOut() {
    const confirmSignOut = confirm("Are you sure you want to sign out?");

    if (confirmSignOut) {
      this.authService.deleteToken();
      this.router.navigateByUrl('/login');
      this.toastr.success("Signed out successfully");
    }
  }
}
