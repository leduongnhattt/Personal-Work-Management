import { Component, ViewChild } from '@angular/core';
import { NoteService } from '../../../core/services/note.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-note-page',
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule],
  templateUrl: './note-page.component.html',
  styleUrl: './note-page.component.css'
})
export class NotePageComponent {
  notes: any[] = [];
  selectedNote: any = { noteId: '', title: '', content: '' };

  constructor(
    private noteService: NoteService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private datePipe: DatePipe
  ) { }
  @ViewChild('editNoteModal') editNoteModal: any;
  modalRef?: BsModalRef;

  formatVietnamTime(date: string): string {
    const vietnamDate = new Date(date);
    vietnamDate.setHours(vietnamDate.getHours() + 7); // Convert to Vietnam timezone
    return this.datePipe.transform(vietnamDate, 'HH:mm dd/MM/yyyy') || '';
  }

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
        this.translate.get('TOASTR.NOTE_UPDATED').subscribe((translatedText: string) => {
          setTimeout(() => this.toastr.success(translatedText), 100);
        });
      },
      (error) => {
        console.error('Lỗi khi cập nhật ghi chú:', error);
      }
    );
  }

  deleteNote(noteId: string): void {
    this.translate.get('TOASTR.CONFIRM_DELETE').subscribe((confirmText: string) => {
      if (confirm(confirmText)) {
        this.noteService.deleteNote(noteId).subscribe(
          (response) => {
            this.notes = this.notes.filter(note => note.noteId !== noteId);
            this.translate.get('TOASTR.NOTE_DELETED').subscribe((translatedText: string) => {
              setTimeout(() => this.toastr.success(translatedText), 100);
            });
          },
          (error) => {
            console.error('Lỗi khi xóa ghi chú:', error);
          }
        );
      }
    });
  }
}
