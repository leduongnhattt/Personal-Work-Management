import { Component, ViewChild } from '@angular/core';
import { NoteService } from '../../../core/services/note.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-note-page',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './note-page.component.html',
  styleUrl: './note-page.component.css'
})
export class NotePageComponent {
  notes: any[] = [];
  selectedNote: any = { noteId: '', title: '', content: '' };

  constructor(private noteService: NoteService, private modalService: BsModalService) {}
  @ViewChild('editNoteModal') editNoteModal: any;
  modalRef?: BsModalRef;

  openModal(template: any, note: any): void {

    this.selectedNote = { ...note };
    this.modalRef = this.modalService.show(template);
    console.log(this.selectedNote.noteId);
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.loadNotes();
    }, 500);
  }

  loadNotes(): void {
    this.noteService.getAllNotes().subscribe(
      (data) => {
        console.log('Dữ liệu từ API:', data);
        this.notes = data.data;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách ghi chú:', error);
      }
    );
  }



  updateNote(): void {
    this.noteService.updateNote(this.selectedNote.noteId, {
      title: this.selectedNote.title,
      content: this.selectedNote.content
    }).subscribe(
      () => {
        this.loadNotes();
        alert('Ghi chú đã được cập nhật!');
      },
      (error) => {
        console.error('Lỗi khi cập nhật ghi chú:', error);
      }
    );
  }

  deleteNote(noteId: string): void {
    if (confirm('BAre you sure you want to delete this note?')) {
      this.noteService.deleteNote(noteId).subscribe(
        () => {
          alert('The note has been deleted!');
          this.loadNotes();
        },
        (error) => {
          console.error('Lỗi khi xóa ghi chú:', error);
        }
      );
    }
  }
}
