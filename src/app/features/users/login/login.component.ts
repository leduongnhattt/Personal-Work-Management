import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirstKeyPipe } from '../../../shared/pipes/first-key.pipe';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  private loginAttempts = 0;
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_TIME = 5 * 60; // 5 minutes in seconds
  private timerSubscription?: Subscription;

  isLocked = false;
  remainingTime = 0;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

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
  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private startLockoutTimer() {
    this.isLocked = true;
    this.remainingTime = this.LOCKOUT_TIME;

    this.timerSubscription = timer(0, 1000).subscribe(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.resetLockout();
      }
    });
  }

  private resetLockout() {
    this.isLocked = false;
    this.loginAttempts = 0;
    this.remainingTime = 0;
    this.timerSubscription?.unsubscribe();
  }

  formatRemainingTime(): string {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onSubmit() {
    if (this.isLocked) {
      this.toastr.error(`Please wait ${this.formatRemainingTime()} before trying again`, 'Account Locked');
      return;
    }

    this.isSubmitted = true;
    if (this.form.valid) {
      const username = this.form.get('username')?.value;
      if (username) {
        this.userService.checkUsernameExists(username).subscribe({
          next: (res) => {
            if (res.status === 'Success') {
              // Username exists, proceed with login
              this.authService.login(this.form.value).subscribe({
                next: (res: any) => {
                  this.resetLockout();
                  this.authService.saveToken(res.accessToken);
                  this.toastr.success('Login successful', 'Welcome!');
                  this.router.navigateByUrl('/main/home');
                },
                error: err => {
                  if (err.status == 400) {
                    this.loginAttempts++;

                    if (this.loginAttempts >= this.MAX_ATTEMPTS) {
                      this.startLockoutTimer();
                      this.toastr.error(`Too many failed attempts. Please try again in ${this.LOCKOUT_TIME / 60} minutes.`, 'Account Locked');
                    } else {
                      const remainingAttempts = this.MAX_ATTEMPTS - this.loginAttempts;
                      this.toastr.error(`Incorrect username or password. ${remainingAttempts} attempts remaining.`, 'Login Failed');
                    }

                    this.form.reset();
                    this.isSubmitted = false;
                  }
                  else {
                    console.log('error during login: \n', err)
                  }
                }
              });
            } else {
              // Username not found, count as failed attempt
              this.loginAttempts++;
              if (this.loginAttempts >= this.MAX_ATTEMPTS) {
                this.startLockoutTimer();
                this.toastr.error(`Too many failed attempts. Please try again in ${this.LOCKOUT_TIME / 60} minutes.`, 'Account Locked');
              } else {
                const remainingAttempts = this.MAX_ATTEMPTS - this.loginAttempts;
                this.toastr.error(`Username does not exist. ${remainingAttempts} attempts remaining.`, 'Login Failed');
              }
              this.form.reset();
              this.isSubmitted = false;
            }
          },
          error: (err) => {
            // Handle API error as a failed attempt
            this.loginAttempts++;
            if (this.loginAttempts >= this.MAX_ATTEMPTS) {
              this.startLockoutTimer();
              this.toastr.error(`Too many failed attempts. Please try again in ${this.LOCKOUT_TIME / 60} minutes.`, 'Account Locked');
            } else {
              const remainingAttempts = this.MAX_ATTEMPTS - this.loginAttempts;
              this.toastr.error(`Username does not exist. ${remainingAttempts} attempts remaining.`, 'Login Failed');
            }
            this.form.reset();
            this.isSubmitted = false;
          }
        });
      }
    }
  }

  hasDisplayError(controlName: string): Boolean {
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
  }

  checkUsername() {
    const username = this.form.get('username')?.value;
    if (username) {
      this.userService.checkUsernameExists(username).subscribe({
        next: (res) => {
          if (res.status === 'Success') {
            this.toastr.success(res.message, 'Success');
          } else {
            this.toastr.warning(res.message, 'Warning');
          }
        },
        error: (err) => {
          console.error('Error checking username:', err);
          this.toastr.error('Error checking username', 'Error');
        }
      });
    }
  }
}
