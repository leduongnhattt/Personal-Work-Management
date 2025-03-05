import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirstKeyPipe } from '../../../shared/pipes/first-key.pipe';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }
  isSubmitted: boolean = false;
  form = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
      ]
    ]
  });

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      console.log(this.form.value);
      this.authService.login(this.form.value).subscribe({
        next: (res: any) => {
          this.authService.saveToken(res.accessToken);
          this.router.navigateByUrl('/main/home');
        },
        error: err => {
          if (err.status == 400) {
            this.toastr.error('Incorrect email or password', 'Login failed');
            this.form.reset();
            this.isSubmitted = false;
          }
          else {
            console.log('error during login: \n', err)
          }
        }
      })
    }
  }
  hasDisplayError(controlName: string): Boolean {
    const control = this.form.get(controlName);

    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
  }
}
