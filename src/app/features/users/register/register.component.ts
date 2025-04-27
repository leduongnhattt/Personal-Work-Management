import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirstKeyPipe } from '../../../shared/pipes/first-key.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router) { }
  ngOnInit(): void {

  }
  isSubmitted: boolean = false;

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value != confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    }
    else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }
  form = this.formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    sdt: ['', [
      Validators.required,
      Validators.pattern(/^0[0-9]{9}$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)]],
    confirmPassword: ['']
  }, { validators: this.passwordMatchValidator });

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      console.log(this.form.value);
      this.authService.registerUser(this.form.value).subscribe({
        next: (res: any) => {
          console.log(res);
          if (res.status === "Success") {
            this.form.reset();
            this.isSubmitted = false;
            this.toastr.success('New user created!', 'Registration Successful');
            this.router.navigate(['/login']);
          }
        },
        error: err => {
          if (err.status === 409) {
            this.toastr.error('Username or email already exists.', 'Registration Failed');
            this.form.reset();
          } else {
            this.toastr.error('An error occurred.', 'Registration Failed');
          }
          this.form.reset();
          console.log('API Error:', err);
        }
      });

    }
  }
  hasDisplayError(controlName: string): Boolean {
    const control = this.form.get(controlName);

    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
  }

}
