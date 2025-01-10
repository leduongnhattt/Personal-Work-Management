import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../layout/header/header.component";
import { SidenavComponent } from "../layout/sidenav/sidenav.component";
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  user : any = {}
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.getUserProfile();
  }

  getUserProfile() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        console.log(res);
        this.user = res;
      }
    }
    );
  }
}
