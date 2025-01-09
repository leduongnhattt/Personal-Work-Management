import { Routes } from '@angular/router';
import { RegisterComponent } from './features/users/register/register.component';
import { LoginComponent } from './features/users/login/login.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { TaskComponent } from './features/task/task.component';
import { MeetingsComponent } from './features/meetings/meetings.component';
import { NotesComponent } from './features/notes/notes.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent },  // Đường dẫn mặc định là trang đăng nhập
  {
    path: 'home', component: HomeComponent, children: [
      { path: 'tasks', component: TaskComponent },
      { path: 'meetings', component: MeetingsComponent },
      { path: 'notes', component: NotesComponent },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' }  
    ]
  }
];

