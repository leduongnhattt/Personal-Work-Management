import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {


  constructor(private http: HttpClient) {}

  createTask(taskData: any): Observable<any> {
    return this.http.post(environment.apiTaskUrl + '/addWork', taskData);
  }
  getAllTasks(): Observable<any> {
    return this.http.get(environment.apiTaskUrl + '/allTask');
  }
  deleteTask(taskId: string): Observable<any> {
   return this.http.delete(`${environment.apiTaskUrl}/deleteTask/${taskId}`,{ responseType: 'text' });
  }
  updateTask(taskId: string, taskData: any): Observable<any> {
    return this.http.put(environment.apiTaskUrl + '/updateTask/' + taskId, taskData);
  }
}
