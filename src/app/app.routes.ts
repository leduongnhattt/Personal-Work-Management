import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { RegisterComponent } from './features/users/register/register.component';
import { LoginComponent } from './features/users/login/login.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { TaskComponent } from './features/task/task.component';
import { MeetingsComponent } from './features/meetings/meetings.component';
import { NotesComponent } from './features/notes/notes.component';
import { MainComponent } from './features/main/main.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ProfileComponent } from './features/users/profile/profile.component';
import { NotePageComponent } from './features/dashboard/note-page/note-page.component';
import { MeetingPageComponent } from './features/dashboard/meeting-page/meeting-page.component';
import { TaskPageComponent } from './features/dashboard/task-page/task-page.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent },
  {
    path: 'main', component: MainComponent, children: [
      { path: 'home', component: HomeComponent },
      { path: 'note_page', component: NotePageComponent },
      { path: 'task_page', component: TaskPageComponent },
      { path: 'meeting_page', component: MeetingPageComponent },
      { path: 'tasks', component: TaskComponent },
      { path: 'meetings', component: MeetingsComponent },
      { path: 'notes', component: NotesComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' }
    ]
  },
  { path: 'profile', component: ProfileComponent }
];

