import { Routes } from '@angular/router';
import { RegisterComponent } from './features/users/register/register.component';
import { LoginComponent } from './features/users/login/login.component';
import { MainComponent } from './features/main/main.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent },
  {
    path: 'main',
    component: MainComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/dashboard/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'note_page',
        loadComponent: () => import('./features/dashboard/note-page/note-page.component').then(m => m.NotePageComponent)
      },
      {
        path: 'task_page',
        loadComponent: () => import('./features/dashboard/task-page/task-page.component').then(m => m.TaskPageComponent)
      },
      {
        path: 'meeting_page',
        loadComponent: () => import('./features/dashboard/meeting-page/meeting-page.component').then(m => m.MeetingPageComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/task/task.component').then(m => m.TaskComponent)
      },
      {
        path: 'meetings',
        loadComponent: () => import('./features/meetings/meetings.component').then(m => m.MeetingsComponent)
      },
      {
        path: 'notes',
        loadComponent: () => import('./features/notes/notes.component').then(m => m.NotesComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent)
      },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/users/profile/profile.component').then(m => m.ProfileComponent)
  }
];

