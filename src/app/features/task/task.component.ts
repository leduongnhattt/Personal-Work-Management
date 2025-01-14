import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaskService } from '../../core/services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  taskForm!: FormGroup;
  dateError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastr: ToastrService
  ) {}

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
      this.dateError = 'Start date must be earlier than or equal to end date.';
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
          this.toastr.success('Task added successfully!');
          this.taskForm.reset();
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('An error occurred while adding the task.');
      },
    });
  }
}
