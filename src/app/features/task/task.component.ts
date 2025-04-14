import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaskService } from '../../core/services/task.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-task',
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  taskForm!: FormGroup;
  dateError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      startDateTask: ['', Validators.required],
      endDateTask: ['', Validators.required],
      status: ['', Validators.required],
      reminderTime: [0, [Validators.required, Validators.min(0)]],
    });
  }

  public validateDates(): boolean {
    const startDate = this.taskForm.get('startDateTask')?.value;
    const endDate = this.taskForm.get('endDateTask')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.translate.get('TOASTR_INVALID_DATE').subscribe((message) => {
        this.dateError = message;
      });
      setTimeout(() => {
        this.taskForm.get('startDateTask')?.reset();
        this.taskForm.get('endDateTask')?.reset();
      }, 3000)
      return false;
    }

    this.dateError = null;
    return true;
  }

  addWorkTask(): void {
    if (!this.validateDates() || !this.taskForm.valid) return;

    this.taskService.createTask(this.taskForm.value).subscribe({
      next: (res: any) => {
        if (res.status === "Success") {
          this.translate.get('TOASTR.TASK_ADDED').subscribe((message) => {
            this.toastr.success(message);
          });
          this.taskForm.reset();
        }
      },
      error: (err) => {
        this.translate.get('TOASTR.ERROR').subscribe((message) => {
          this.toastr.error(message);
        });
        this.taskForm.reset();
      },
    });
  }
}
