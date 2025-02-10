import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private http: HttpClient) { }

  createMeeting(meeting: any): Observable<any>{
    return this.http.post(environment.apiMeetingUrl + '/addApointment', meeting)
    .pipe(
      catchError(error => this.handleError(error))
    );
  }
  getAllMeetings(): Observable<any>{
    return this.http.get(environment.apiMeetingUrl + '/allApointment')
    .pipe(
      catchError(error => this.handleError(error))
    );
  }
  updateMeeting(meetingId: string, meeting: any): Observable<any>{
    return this.http.put(environment.apiMeetingUrl + '/updateApointment/' + meetingId, meeting)
    .pipe(
      catchError(error => this.handleError(error))
    );
  }
  deleteMeeting(meetingId: string): Observable<any>{
    return this.http.delete(environment.apiMeetingUrl + '/deleteApointment/' + meetingId)
    .pipe(
      catchError(error => this.handleError(error))
    );
  }
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Something went wrong!'));
  }
}
