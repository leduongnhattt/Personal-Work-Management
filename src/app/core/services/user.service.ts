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
  updatePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${environment.apiAuthUrl}/update-password`, { oldPassword, newPassword });
  }
  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiAuthUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiAuthUrl}/profile`, data);
  }
  exisitingUser(email: string): Observable<any> {
    return this.http.get(`${environment.apiAuthUrl}/existing-user/${email}`);
  }
  checkUsernameExists(username: string): Observable<{ message: string, status: string, userName?: string }> {
    return this.http.get<{ message: string, status: string, userName?: string }>(`${environment.apiAuthUrl}/existing-user?username=${username}`);
  }
}
