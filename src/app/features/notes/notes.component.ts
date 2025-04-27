import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  noteForm!: FormGroup;
  maxTitleLength: number = 50;

  constructor(
    private formBuilder: FormBuilder,
    private noteService: NoteService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.noteForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.maxLength(this.maxTitleLength)
      ]],
      content: ['', Validators.required],
    });

    // Theo dõi thay đổi của title
    this.noteForm.get('title')?.valueChanges.subscribe(value => {
      if (value && value.length > this.maxTitleLength) {
        this.toastr.error(this.translate.instant('validation.maxLength'));
      }
    });
  }

  get titleControl() {
    return this.noteForm.get('title');
  }

  get contentControl() {
    return this.noteForm.get('content');
  }

  addNote() {
    if (this.noteForm.valid) {
      this.noteService.createNote(this.noteForm.value).subscribe({
        next: (res: any) => {
          if (res.status === "Success") {
            this.translate.get('TOASTR.NOTE_ADDED').subscribe((message) => {
              this.toastr.success(message);
            });
            this.noteForm.reset();
          }
        },
        error: (error) => {
          this.translate.get('TOASTR.ERROR').subscribe((message) => {
            this.toastr.error(message);
          });
          this.noteForm.reset();
        }
      });
    } else {
      // Mark all fields as touched to show validation messages
      Object.keys(this.noteForm.controls).forEach(key => {
        const control = this.noteForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}

