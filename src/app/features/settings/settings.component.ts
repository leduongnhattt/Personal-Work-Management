import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder,  FormsModule,  ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-settings',
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent {
  isDarkMode = false;

  ngOnInit() {
      const savedMode = localStorage.getItem('darkMode');
      this.isDarkMode = savedMode === 'true';
      this.applyDarkMode();
  }

  toggleDarkMode(event: any) {
    this.isDarkMode = event.target.checked;
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyDarkMode();
  }

  applyDarkMode() {
      document.body.classList.toggle('bg-dark', this.isDarkMode);
      document.body.classList.toggle('text-white', this.isDarkMode);
  }
}
