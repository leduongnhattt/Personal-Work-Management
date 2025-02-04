import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor( private router: Router) {}
  onLogout() {
    this.router.navigateByUrl('/login');
  }
  navigateTo(route: string) {
    this.router.navigateByUrl(`/${route}`);
  }
}
