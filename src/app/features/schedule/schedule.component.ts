import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-schedule',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatTooltipModule
  ],
  providers: [DatePipe],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  schedule: any = { tasks: [], apointments: [] };
  searchTerm: string = '';
  showTasks: boolean = true;
  showAppointments: boolean = true;
  filteredTasks: any[] = [];
  filteredAppointments: any[] = [];
  isSearching: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private datePipe: DatePipe
  ) { }

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
          this.filteredTasks = [...this.schedule.tasks];
          this.filteredAppointments = [...this.schedule.apointments];
          this.isSearching = false;
          console.log(this.schedule);
        } else {
          console.error('Invalid schedule data format:', data);
        }
      },
      error: (error) => console.error('There was an error!', error),
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.resetToDefault();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredTasks = this.schedule.tasks.filter((task: any) =>
      task.title.toLowerCase().includes(term)
    );
    this.filteredAppointments = this.schedule.apointments.filter((appointment: any) =>
      appointment.title.toLowerCase().includes(term)
    );
  }

  performSearch(): void {
    if (!this.searchTerm.trim()) {
      this.resetToDefault();
      return;
    }
    this.onSearch();
    this.isSearching = true;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.resetToDefault();
  }

  resetToDefault(): void {
    this.filteredTasks = [...this.schedule.tasks];
    this.filteredAppointments = [...this.schedule.apointments];
    this.isSearching = false;
  }

  toggleTasks(): void {
    this.showTasks = !this.showTasks;
  }

  toggleAppointments(): void {
    this.showAppointments = !this.showAppointments;
  }

  formatDate(date: any): string {
    if (!date) return 'Chưa có';
    const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy HH:mm');
    return formattedDate || 'Chưa có';
  }

  getDescription(text: string | null | undefined): string {
    return text || 'Không có mô tả';
  }

  getLocation(text: string | null | undefined): string {
    return text || 'Không có địa điểm';
  }

  getTitle(text: string | null | undefined): string {
    return text || 'Không có tiêu đề';
  }
}
