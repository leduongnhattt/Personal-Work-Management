import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-schedule',
  imports: [CommonModule, MatCardModule, MatIconModule, TranslateModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  schedule: any = { tasks: [], apointments: [] };

  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchSchedule(userId);
    } else {
      console.error('User ID is not available.');
    }
  }

  fetchSchedule(userId: string): void {
    this.userService.getSchedule(userId).subscribe({
      next: (data) => {
        if (data && data.data) {
          this.schedule = data.data;
          console.log(this.schedule);
        } else {
          console.error('Invalid schedule data format:', data);
        }
      },
      error: (error) => console.error('There was an error!', error),
    });
  }
}
