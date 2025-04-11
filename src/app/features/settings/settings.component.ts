import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  isPushNotificationEnabled = false;

  constructor(private translateService: TranslateService) { }
  ngOnInit() {
    this.lang = localStorage.getItem('lang') || 'en';
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
    this.applyDarkMode();

    // Load push notification preference
    const savedPushNotification = localStorage.getItem('pushNotification');
    this.isPushNotificationEnabled = savedPushNotification === 'true';
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

  togglePushNotification(event: any) {
    this.isPushNotificationEnabled = event.target.checked;
    localStorage.setItem('pushNotification', String(this.isPushNotificationEnabled));

    if (this.isPushNotificationEnabled) {
      this.requestPushNotificationPermission();
    }
  }

  private async requestPushNotificationPermission() {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Push notification permission granted');
        } else {
          console.log('Push notification permission denied');
          this.isPushNotificationEnabled = false;
          localStorage.setItem('pushNotification', 'false');
        }
      } catch (error) {
        console.error('Error requesting push notification permission:', error);
        this.isPushNotificationEnabled = false;
        localStorage.setItem('pushNotification', 'false');
      }
    } else {
      console.log('Push notifications are not supported in this browser');
      this.isPushNotificationEnabled = false;
      localStorage.setItem('pushNotification', 'false');
    }
  }
}
