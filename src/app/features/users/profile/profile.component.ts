import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../layout/header/header.component";
import { SidenavComponent } from "../../layout/sidenav/sidenav.component";

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [HeaderComponent, SidenavComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  currentTab: string = 'general';
  form!: FormGroup;
  selectedFile: File | null = null;
  isImageServer: boolean = false;
  imageUrl: string = '';
  constructor(private userService: UserService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getUserProfile();
    this.initForm();
  }

  // Initialize the form with validators
  initForm() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      email: ['', [Validators.required, Validators.email]],
      imageUrl: ['', Validators.required],
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', Validators.required, Validators.minLength(6)],
      repeatPassword: ['', Validators.required, Validators.minLength(6)],
    });
  }

  // Fetch user profile from the API
  getUserProfile() {
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        console.log('User Profile:', res);
        this.user = res;
        this.isImageServer = true;
        this.form.patchValue({
          username: res.data?.userName || '',
          phoneNumber: res.data?.sdt || '',
          email: res.data?.email || '',
          imageUrl: res.data?.image || ''
        });
      },
      error: (err) => console.error('Failed to fetch user profile:', err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageElement = document.querySelector('.rounded-circle') as HTMLImageElement;
        if (imageElement) {
          imageElement.src = e.target?.result as string;
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updateProfile(): void {
    if (this.form.valid) {
      const formData = new FormData();
      formData.append('UserName', this.form.value.username);
      formData.append('SDT', this.form.value.phoneNumber);
      formData.append('Email', this.form.value.email);
      if (this.selectedFile) {
        formData.append('imageFile', this.selectedFile, this.selectedFile.name);
      }
      this.userService.updateProfile(formData).subscribe({
        next: (res: any) => {
          console.log(res);
          this.toastr.success('Profile updated successfully!')
          this.getUserProfile();
        },
        error: (err) => this.toastr.error('Failed to update profile. Please try again!'),
      });
    } else {
      alert('Please fix the form errors before submitting!');
    }
  }
  updatePassword(): void {

    const oldPassword = this.form.get('oldPassword')?.value;
    const newPassword = this.form.get('newPassword')?.value;
    const repeatPassword = this.form.get('repeatPassword')?.value;
    console.log("oldPassword", oldPassword);
    console.log("newPassword", newPassword);
    console.log("repeatPassword", repeatPassword);
    if (newPassword !== repeatPassword) {
      this.toastr.error('New password does not match the re-entered password');
      return;
    }
    this.userService.updatePassword(oldPassword, newPassword).subscribe({
      next: (res: any) => {
        console.log(res);
        this.toastr.success('Password updated successfully!');
        this.resetPassword();
      },
      error: (err: any) => {
        if (err.status === 400) {
          this.toastr.error('Incorrect old password');
        }
        else {
          this.toastr.error('Failed to update password. Please try again!');
        }
        this.resetPassword();
      },
    });
  }
  // Reset the profile image preview to the original or default image
  resetImage(): void {
    this.selectedFile = null;
    const imageElement = document.querySelector('.rounded-circle') as HTMLImageElement;
    if (imageElement) {
      this.getUserProfile();

    }
  }

  // Switch between different tabs in the profile
  setTab(tabName: string): void {
    this.currentTab = tabName;
  }
  isActiveTab(tabName: string): boolean {
    return this.currentTab === tabName;
  }
  resetPassword(): void {
    this.form.get('oldPassword')?.reset();
    this.form.get('newPassword')?.reset();
    this.form.get('repeatPassword')?.reset();
  }
}
