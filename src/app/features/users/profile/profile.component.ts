import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../layout/header/header.component";
import { SidenavComponent } from "../../layout/sidenav/sidenav.component";

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { SocialLinkService } from '../../../core/services/social-link.service';
import { SocialLink } from '../../../core/models/social-link.model';

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
  socialLinks: SocialLink[] = [];

  constructor(
    private userService: UserService,
    private socialLinkService: SocialLinkService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getUserProfile();
    this.initForm();
    this.getSocialLinks();
  }

  // Initialize the form with validators
  initForm() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^0\d{9}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      imageUrl: [''],
      oldPassword: [''],
      newPassword: [''],
      repeatPassword: [''],
      twitter: ['', Validators.pattern(/^https?:\/\/(?:www\.)?twitter\.com\/[A-Za-z0-9_]{1,15}$/)],
      facebook: ['', Validators.pattern(/^https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9.]+$/)],
      linkedin: ['', Validators.pattern(/^https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/[A-Za-z0-9-]+$/)],
      instagram: ['', Validators.pattern(/^https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._]+$/)],
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

  getSocialLinks() {
    this.socialLinkService.getUserSocialLinks().subscribe({
      next: (response) => {
        if (response.status === 'Success') {
          this.socialLinks = response.data;
          // Update form values with existing social links
          const twitterLink = this.socialLinks.find(link => link.platform === 'Twitter');
          const facebookLink = this.socialLinks.find(link => link.platform === 'Facebook');
          const linkedinLink = this.socialLinks.find(link => link.platform === 'LinkedIn');
          const instagramLink = this.socialLinks.find(link => link.platform === 'Instagram');

          this.form.patchValue({
            twitter: twitterLink?.url || '',
            facebook: facebookLink?.url || '',
            linkedin: linkedinLink?.url || '',
            instagram: instagramLink?.url || ''
          });
        }
      },
      error: (err) => {
        console.error('Failed to fetch social links:', err);
        this.toastr.error('Failed to load social links');
      }
    });
  }

  updateSocialLinks() {
    const socialLinks = [
      { platform: 'Twitter', url: this.form.value.twitter },
      { platform: 'Facebook', url: this.form.value.facebook },
      { platform: 'LinkedIn', url: this.form.value.linkedin },
      { platform: 'Instagram', url: this.form.value.instagram }
    ].filter(link => link.url && this.form.get(link.platform.toLowerCase())?.valid);

    if (socialLinks.length > 0) {
      this.socialLinkService.addMultipleSocialLinks({ socialLinks }).subscribe({
        next: (response) => {
          if (response.status === 'Success') {
            this.toastr.success('Social links updated successfully');
            this.getSocialLinks();
          } else {
            this.toastr.error(response.message || 'Failed to update social links');
          }
        },
        error: (err) => {
          console.error('Failed to update social links:', err);
          this.toastr.error('Failed to update social links');
        }
      });
    } else {
      const hasInvalidLinks = ['twitter', 'facebook', 'linkedin', 'instagram']
        .some(control => this.form.get(control)?.invalid && this.form.get(control)?.value);

      if (hasInvalidLinks) {
        this.toastr.error('Please enter valid URLs for social links');
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check file format
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Only JPG and PNG files are allowed');
        input.value = ''; // Clear the input
        return;
      }

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastr.error('File size must be less than 2MB');
        input.value = ''; // Clear the input
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageElement = document.querySelector('.rounded-circle') as HTMLImageElement;
        if (imageElement && e.target?.result) {
          imageElement.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updateProfile(): void {
    if (this.isActiveTab('general')) {
      const generalControls = ['username', 'phoneNumber', 'email'];
      if (this.validateFormControls(generalControls)) {
        const formData = new FormData();
        formData.append('UserName', this.form.value.username);
        formData.append('SDT', this.form.value.phoneNumber);
        formData.append('Email', this.form.value.email);
        if (this.selectedFile) {
          formData.append('imageFile', this.selectedFile, this.selectedFile.name);
        }

        this.userService.updateProfile(formData).subscribe({
          next: (res: any) => {
            if (res.status === 'Success') {
              this.toastr.success('Profile updated successfully!');
              this.getUserProfile();
            } else {
              this.toastr.error(res.message || 'Failed to update profile');
            }
          },
          error: (err) => this.toastr.error('Failed to update profile. Please try again!'),
        });
      }
    } else if (this.isActiveTab('social-links')) {
      this.updateSocialLinks();
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

  validateFormControls(controls: string[]): boolean {
    let isValid = true;
    controls.forEach(control => {
      const formControl = this.form.get(control);
      if (formControl?.invalid) {
        formControl.markAsTouched();
        isValid = false;
      }
    });

    if (!isValid) {
      this.toastr.error('Please fix the form errors before submitting!');
    }
    return isValid;
  }
}
