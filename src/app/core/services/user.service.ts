import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private service: AuthService) { }

  getSchedule(userId: string): Observable<any> {
    return this.http.get(`${environment.apiScheduleUrl}/getAll/${userId}`);
  }
}
