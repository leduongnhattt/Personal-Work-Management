import { Component } from '@angular/core';
import { HeaderComponent } from "../layout/header/header.component";
import { SidenavComponent } from "../layout/sidenav/sidenav.component";
import { SidebarService } from '../../core/services/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
@Component({
    selector: 'app-main',
    imports: [HeaderComponent, SidenavComponent, RouterOutlet, CommonModule],
    templateUrl: './main.component.html',
    styleUrl: './main.component.css'
})
export class MainComponent {
  isSidebarVisible = true;
  constructor(private sidebarService: SidebarService) {}


  ngOnInit() {
    this.sidebarService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidebarVisible = isVisible;
    });
  }
}
