import { DatePipe, CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MeetingService } from '../../../core/services/meeting.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-meeting-page',
  imports: [CommonModule, FormsModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './meeting-page.component.html',
  styleUrl: './meeting-page.component.css'
})
export class MeetingPageComponent implements OnInit {
  apointments: any[] = [];
  selectedApointment: any = { apointmentId: '', title: '', description: '', startDateApoint: '', endDateApoint: '', location: '', reminderTime: '' };
  editForm!: FormGroup;

  constructor(
    private meetingService: MeetingService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private fb: FormBuilder
  ) { }

  formatVietnamTime(date: string): string {
    const vietnamDate = new Date(date);
    vietnamDate.setHours(vietnamDate.getHours() + 7); // Convert to Vietnam timezone
    return this.datePipe.transform(vietnamDate, 'dd/MM/yyyy') || '';
  }

  @ViewChild('editApointmentModal') editApointmentModal: any;
  modalRef?: BsModalRef;
  ngOnInit(): void {
    this.initializeForm();
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
    this.editForm.patchValue(this.selectedApointment);
    this.modalRef = this.modalService.show(template);
  }
  updateApointment(): void {
    if (this.editForm.invalid) {
      this.validateAllFormFields(this.editForm);
      return;
    }

    const formValue = this.editForm.value;
    if (new Date(formValue.startDateApoint) > new Date(formValue.endDateApoint)) {
      this.toastr.error(this.translate.instant('TOASTR.INVALID_DATE'));
      return;
    }

    this.meetingService.updateMeeting(this.selectedApointment.apointmentId, formValue).subscribe(
      () => {
        this.loadApointments();
        this.translate.get('TOASTR.MEETING_UPDATED').subscribe((translatedText: string) => {
          setTimeout(() => this.toastr.success(translatedText), 100);
        });
      },
      (error) => {
        console.error('Error updating meeting', error);
      }
    );
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }
  deleteApointment(apointmentId: string): void {
    this.translate.get('TOASTR.CONFIRM_DELETE_MEETING').subscribe((confirmText: string) => {
      if (confirm(confirmText)) {
        this.meetingService.deleteMeeting(apointmentId).subscribe(
          () => {
            this.translate.get('TOASTR.MEETING_DELETED').subscribe((translatedText: string) => {
              setTimeout(() => this.toastr.success(translatedText), 100);
            });
            this.apointments = this.apointments.filter(apointment => apointment.apointmentId !== apointmentId);
          },
          (error) => {
            console.error('Lỗi khi xóa cuộc họp:', error);
          }
        );
      }
    });
  }

  async exportToPDF(): Promise<void> {
    if (this.apointments.length === 0) {
      this.toastr.error(this.translate.instant('TOASTR.NO_MEETINGS_TO_EXPORT'));
      return;
    }

    try {
      await this.exportService.exportToPDF('meetingList', 'meetings', true);
      this.toastr.success(this.translate.instant('TOASTR.EXPORT_PDF_SUCCESS'));
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.toastr.error(this.translate.instant('TOASTR.EXPORT_PDF_ERROR'));
    }
  }

  async exportToExcel(): Promise<void> {
    if (this.apointments.length === 0) {
      this.toastr.error(this.translate.instant('TOASTR.NO_MEETINGS_TO_EXPORT'));
      return;
    }

    try {
      const formattedData = this.exportService.formatDataForExport(this.apointments, 'meeting');
      await this.exportService.exportToExcel(formattedData, 'meetings', true);
      this.toastr.success(this.translate.instant('TOASTR.EXPORT_EXCEL_SUCCESS'));
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.toastr.error(this.translate.instant('TOASTR.EXPORT_EXCEL_ERROR'));
    }
  }

  printMeetings(): void {
    if (this.apointments.length === 0) {
      this.toastr.error(this.translate.instant('TOASTR.NO_MEETINGS_TO_PRINT'));
      return;
    }
    window.print();
  }

  private initializeForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.required],
      startDateApoint: ['', Validators.required],
      endDateApoint: ['', Validators.required],
      location: ['', Validators.required],
      reminderTime: [0, [Validators.required, Validators.min(0)]]
    });
  }
}
