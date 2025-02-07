import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { start } from 'repl';

@Component({
  selector: 'app-task-page',
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './task-page.component.html',
  styleUrl: './task-page.component.css'
})
export class TaskPageComponent implements OnInit {
  constructor(private taskService: TaskService,
    private modalService: BsModalService,
    private toastr: ToastrService
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
    this.taskService.getAllTasks().subscribe(
      (data) => {
        console.log('Dữ liệu từ API:', data);
        this.tasks = data.data;
      }
    );
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
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe(
        (response) => {
          this.toastr.success('Task has been deleted!');
          this.tasks = this.tasks.filter(task => task.workTaskId !== taskId);
        },
        (error) => {
          console.error('Error deleting tasks', error);
        }
      );
    }
  }
  updateTask(): void {
    if (new Date(this.selectedTask.startDateTask) > new Date(this.selectedTask.endDateTask)) {
      this.toastr.error('Start date must be before or equal to end date!');
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
        this.toastr.success('Task has been updated!');
      },
      (error) => {
        console.error('Error updating tasks:', error);
      }
    );
  }
}
