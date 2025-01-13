import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../layout/header/header.component";
import { SidenavComponent } from "../layout/sidenav/sidenav.component";
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {}; // Holds the current user profile data
  currentTab: string = 'general'; // Default tab
  form!: FormGroup; // The form group
  selectedFile: File | null = null; // File selected for upload
  image: any;

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.getUserProfile(); // Fetch user profile on component load
    this.initForm(); // Initialize the form
  }

  // Initialize the form with validators
  initForm() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      email: ['', [Validators.required, Validators.email]],
      imageUrl: ['', Validators.required]
    });
  }

  // Fetch user profile from the API
  getUserProfile() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        console.log('User Profile:', res);
        this.user = res;
        this.form.patchValue({
          username: res.token?.userName || '',
          phoneNumber: res.token?.sdt || '',
          email: res.token?.email || '',
          imageUrl: res.token?.image || ''
        });
      },
      error: (err) => console.error('Failed to fetch user profile:', err),
    });
  }

  // Handle file selection for profile image
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
      reader.readAsDataURL(this.selectedFile); // Preview the image
    }
  }

  // Handle profile update
  updateProfile(): void {
    if (this.form.valid) {
      const formData = new FormData();
      formData.append('UserName', this.form.value.username);
      formData.append('SDT', this.form.value.phoneNumber);
      formData.append('Email', this.form.value.email);
      if (this.selectedFile) {
        formData.append('imageFile', this.selectedFile, this.selectedFile.name);
      }

      this.authService.updateProfile(formData).subscribe({
        next: (res: any) => {
          console.log(res);
          alert('Profile updated successfully!');
          this.user.token.Image = res?.data.imageUrl || this.user.token.profileImage;
          this.resetImage(); // Reset the image preview to the latest profile image
        },
        error: (err) => alert('Failed to update profile. Please try again!'),
      });
    } else {
      alert('Please fix the form errors before submitting!');
    }
  }

  // Reset the profile image preview to the original or default image
  resetImage(): void {
    this.selectedFile = null;
    const imageElement = document.querySelector('.rounded-circle') as HTMLImageElement;
    if (imageElement) {
      imageElement.src = this.user.token?.profileImage || 'https://bootdey.com/img/Content/avatar/avatar1.png';
    }
  }

  // Switch between different tabs in the profile
  setTab(tabName: string): void {
    this.currentTab = tabName;
  }

  // Check if the current tab is active
  isActiveTab(tabName: string): boolean {
    return this.currentTab === tabName;
  }
}
