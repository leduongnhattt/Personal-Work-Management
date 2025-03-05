import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { start } from 'repl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-task-page',
  imports: [CommonModule, DatePipe, FormsModule, TranslateModule],
  templateUrl: './task-page.component.html',
  styleUrl: './task-page.component.css'
})
export class TaskPageComponent implements OnInit {
  constructor(private taskService: TaskService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) { }
  selectedTask: any = { workTaskId: '', title: '', description: '', startDateTask: '', endDateTask: '', status: '', reminderTime: '' };
  ngOnInit(): void {
    setTimeout(() => {
      this.loadTasks();
    }, 200);
  }
  tasks: any[] = [];
  @ViewChild('editTaskModal') editTaskModal: any;
  modalRef?: BsModalRef;;
  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (res: any) => {
        this.tasks = res.data || [];
      },
      error: () => {
        this.tasks = [];
      },
    });
  }
  openModal(template: any, task: any): void {
    this.selectedTask = {
      ...task,
      startDateTask: task.startDateTask ? task.startDateTask.split('T')[0] : '',
      endDateTask: task.endDateTask ? task.endDateTask.split('T')[0] : ''
    };
    this.modalRef = this.modalService.show(template);
    console.log(this.selectedTask);
  }
  deleteTask(taskId: string): void {
    this.translate.get('TOASTR.CONFIRM_DELETE_TASK').subscribe((confirmText: string) => {
      if (confirm(confirmText)) {
        this.taskService.deleteTask(taskId).subscribe(
          () => {
            this.translate.get('TOASTR.TASK_DELETED').subscribe((translatedText: string) => {
              setTimeout(() => this.toastr.success(translatedText), 100);
            });
            this.tasks = this.tasks.filter(task => task.workTaskId !== taskId);
          },
          (error) => {
            console.error('Lỗi khi xóa cuộc họp:', error);
          }
        );
      }
    });
  }
  updateTask(): void {
    if (new Date(this.selectedTask.startDateTask) > new Date(this.selectedTask.endDateTask)) {
      this.toastr.error(this.translate.instant('TOASTR.INVALID_DATE'));
      return;
    }
    this.taskService.updateTask(this.selectedTask.workTaskId, {
      title: this.selectedTask.title,
      description: this.selectedTask.description,
      startDateTask: this.selectedTask.startDateTask,
      endDateTask: this.selectedTask.endDateTask,
      status: this.selectedTask.status,
      reminderTime: this.selectedTask.reminderTime
    }).subscribe(
      (response) => {
        this.loadTasks();
        this.translate.get('TOASTR.TASK_UPDATED').subscribe((translatedText: string) => {
          setTimeout(() => this.toastr.success(translatedText), 100);
        });
      },
      (error) => {
        console.error('Error updating tasks:', error);
      }
    );
  }
}
