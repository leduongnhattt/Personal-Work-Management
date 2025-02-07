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
  getAllMeetings(): Observable<any>{
    return this.http.get(environment.apiMeetingUrl + '/allApointment');
  }
  updateMeeting(meetingId: string, meeting: any): Observable<any>{
    return this.http.put(environment.apiMeetingUrl + '/updateApointment/' + meetingId, meeting);
  }
  deleteMeeting(meetingId: string): Observable<any>{
    return this.http.delete(environment.apiMeetingUrl + '/deleteApointment/' + meetingId);
  }
}
