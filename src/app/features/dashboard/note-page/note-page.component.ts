import { Component, ElementRef, ViewChild } from '@angular/core';
import { NoteService } from '../../../core/services/note.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-note-page',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './note-page.component.html',
  styleUrl: './note-page.component.css'
})
export class NotePageComponent {
  notes: any[] = [];
  selectedNote: any = { noteId: '', title: '', content: '' };

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.noteService.getAllNotes().subscribe(
      (data) => {
        this.notes = data.data;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách ghi chú:', error);
      }
    );
  }

  editNote(note: any): void {
    this.selectedNote = { ...note };
    console.log(this.selectedNote);

  }

  updateNote(): void {
    this.noteService.updateNote(this.selectedNote.noteId, {
      title: this.selectedNote.title,
      content: this.selectedNote.content,
      createdAt: this.selectedNote.createdAt
    }).subscribe(
      (response) => {
        this.loadNotes();
        alert('Ghi chú đã được cập nhật!');
      },
      (error) => {
        console.error('Lỗi khi cập nhật ghi chú:', error);
      }
    );
  }


  deleteNote(noteId: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
      this.noteService.deleteNote(noteId).subscribe(
        (response) => {
          alert('Ghi chú đã được xóa!');
          this.loadNotes();
        },
        (error) => {
          console.error('Lỗi khi xóa ghi chú:', error);
        }
      );
    }
  }
}
