import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MeetingService } from '../../core/services/meeting.service';
import { ToastrService } from 'ngx-toastr';
import { error } from 'console';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css'
})
export class MeetingsComponent implements OnInit {
  meetingForm!: FormGroup;
  dateError: string | null = null;
  showOnlineMeeting = false;

  constructor(
    private formBuilder: FormBuilder,
    private meetingSerivce: MeetingService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.meetingForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      description: ['', Validators.required],
      location: ['', Validators.required],
      startDateApoint: ['', Validators.required],
      endDateApoint: ['', Validators.required],
      reminderTime: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^-?\\d*$')
      ]],
    });
  }

  addMeeting() {
    if (!this.validateDates() || !this.meetingForm.valid) return;
    this.meetingSerivce.createMeeting(this.meetingForm.value).subscribe({
      next: (res: any) => {
        if (res.status === 'Success') {
          this.translate.get('TOASTR.MEETING_ADDED').subscribe((message) => {
            this.toastr.success(message);
          });
          this.meetingForm.reset();
        }
      },
      error: (error) => {
        console.error(error);
        this.translate.get('TOASTR.ERROR').subscribe((message) => {
          this.toastr.error(message);
        });
        this.meetingForm.reset();
      }
    });
  }

  public validateDates(): boolean {
    const startDate = this.meetingForm.get('startDateApoint')?.value;
    const endDate = this.meetingForm.get('endDateApoint')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.dateError = 'Start date must be earlier than or equal to end date.';
      setTimeout(() => {
        this.meetingForm.get('startDateApoint')?.reset();
        this.meetingForm.get('endDateApoint')?.reset();
      }, 3000);
      return false;
    }

    this.dateError = null;
    return true;
  }
}
