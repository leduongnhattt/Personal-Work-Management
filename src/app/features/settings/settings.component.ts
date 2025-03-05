import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder,  FormsModule,  ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-settings',
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  isDarkMode = false;
  lang: string = '';

  constructor(private translateService: TranslateService) {}
  ngOnInit() {
      this.lang = localStorage.getItem('lang') || 'en';
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
  ChangeLanguage(lang: any) {
    const selectedLanguage = lang.target.value;
    localStorage.setItem('lang', selectedLanguage);
    this.translateService.use(selectedLanguage);
  }
}
