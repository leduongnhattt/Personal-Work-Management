import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { title } from 'process';
import { NoteService } from '../../core/services/note.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-notes',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './notes.component.html',
    styleUrl: './notes.component.css'
})
export class NotesComponent implements OnInit{

  constructor(private formBuilder: FormBuilder, private noteService: NoteService, private toastr: ToastrService){}
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
            this.toastr.success('Note added successfully!');
            this.noteForm.reset();
          }
        },
        error: (error) => {
          this.toastr.error('An error occurred while adding the note.');
          this.noteForm.reset();
        }
      })
    }
  }
}
