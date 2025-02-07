import { DatePipe, CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../../core/services/meeting.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-meeting-page',
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './meeting-page.component.html',
  styleUrl: './meeting-page.component.css'
})
export class MeetingPageComponent implements OnInit {
  apointments: any[] = [];
  selectedApointment: any = { apointmentId: '', title: '', description: '', startDateApoint: '', endDateApoint: '', location: '', reminderTime: '' };
  constructor(private meetingService: MeetingService, private modalService: BsModalService, private toastr: ToastrService) { }
  @ViewChild('editApointmentModal') editApointmentModal: any;
  modalRef?: BsModalRef;
  ngOnInit(): void {
    setTimeout(() => {
      this.loadApointments();
    }, 200);
  }
  loadApointments(): void {
    this.meetingService.getAllMeetings().subscribe(
      (data) => {
        console.log('Dữ liệu từ API:', data);
        this.apointments = data.data;
      }
    );
  }
  openModal(template: any, apointment: any): void {
    this.selectedApointment = {
      ...apointment,
      startDateApoint: apointment.startDateApoint ? apointment.startDateApoint.split('T')[0] : '',
      endDateApoint: apointment.endDateApoint ? apointment.endDateApoint.split('T')[0] : ''
    };
    this.modalRef = this.modalService.show(template);
    console.log(this.selectedApointment);
  }
  updateApointment(): void {
    if (new Date(this.selectedApointment.startDateApoint) > new Date(this.selectedApointment.endDateApoint)) {
      this.toastr.error('Start date must be before end date');
      return;
    }
    this.meetingService.updateMeeting(this.selectedApointment.apointmentId, {
      title: this.selectedApointment.title,
      description: this.selectedApointment.description,
      startDateApoint: this.selectedApointment.startDateApoint,
      endDateApoint: this.selectedApointment.endDateApoint,
      location: this.selectedApointment.location,
      reminderTime: this.selectedApointment.reminderTime
    }).subscribe(
      () => {
        this.loadApointments();
        this.toastr.success('Meeting has been updated!');
      },
      (error) => {
        console.error('Error updating meeting', error);
      }
    );
  }
  deleteApointment(apointmentId: string): void {
    if (confirm('Are you sure you want to delete this meeting?')) {
      this.meetingService.deleteMeeting(apointmentId).subscribe(
        (response) => {
          this.toastr.success('Meeting has been deleted!');
          this.apointments = this.apointments.filter(apointment => apointment.apointmentId !== apointmentId);
        },
        (error) => {
          console.error('Error deleting meeting', error);
        }
      );
    }
  }
}
