import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { title } from 'process';
import { NoteService } from '../../core/services/note.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notes',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css'
})
export class NotesComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private noteService: NoteService, private toastr: ToastrService, private translate: TranslateService) { }
  ngOnInit(): void {
    this.initializeForm();
  }
  noteForm!: FormGroup;

  initializeForm() {
    this.noteForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  addNote() {
    if (this.noteForm.valid) {
      this.noteService.createNote(this.noteForm.value).subscribe({
        next: (res: any) => {
          if (res.status === "Success") {
            this.translate.get('NOTE_ADDED').subscribe((message) => {
              this.toastr.success(message);
            });
            this.noteForm.reset();
          }
        },
        error: (error) => {
          this.translate.get('ERROR').subscribe((message) => {
            this.toastr.error(message);
          });
          this.noteForm.reset();
        }
      })
    }
  }
}
