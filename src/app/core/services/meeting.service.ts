import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private http: HttpClient) { }

  createMeeting(meeting: any): Observable<any>{
    return this.http.post(environment.apiMeetingUrl + '/addApointment', meeting);
  }
}
