import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MeetingService } from '../../core/services/meeting.service';
import { ToastrService } from 'ngx-toastr';
import { error } from 'console';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css'
})
export class MeetingsComponent implements OnInit{
  meetingForm!: FormGroup;
  dateError: string | null = null;

  constructor(private formBuilder: FormBuilder, private meetingSerivce: MeetingService, private toastr: ToastrService) {}
  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() : void {
    this.meetingForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      startDateApoint: ['', Validators.required],
      endDateApoint: ['', Validators.required],
      reminderTime: [0, [Validators.required, Validators.min(0)]],
    })
  }

  addMeeting() {
    if (!this.validateDates() || !this.meetingForm.valid) return;
    this.meetingSerivce.createMeeting(this.meetingForm.value).subscribe({
      next: (res: any) => {
        if (res.status === 'Success') {
          this.toastr.success('Meeting added successfully!');
          this.meetingForm.reset();
        }
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('An error occurred while adding the meeting.');
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
      }, 3000)
      return false;
    }

    this.dateError = null;
    return true;
  }
}
