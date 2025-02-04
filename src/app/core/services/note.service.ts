import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient) { }

  createNote(note: any): Observable<any> {
    return this.http.post(environment.apiNoteUrl + '/addNote', note);
  }
  getAllNotes(): Observable<any> {
    return this.http.get(environment.apiNoteUrl + '/allNote');
  }
  updateNote(noteId: string, note: any): Observable<any> {
    return this.http.put(`${environment.apiNoteUrl}/updateNote/${noteId}`, note);
  }

  deleteNote(noteId: string): Observable<any> {
    return this.http.delete(`${environment.apiNoteUrl}/deleteNote/${noteId}`);
  }

}
