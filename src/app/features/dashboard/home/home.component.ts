import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterOutlet, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  constructor(private router: Router) { }
  onLogout() {
    this.router.navigateByUrl('/login');
  }
  navigateTo(route: string) {
    this.router.navigateByUrl(`/${route}`);
  }
}
