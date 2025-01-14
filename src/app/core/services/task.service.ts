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
}
