import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;

    if (password === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const registerData = {
      fullName: this.signupForm.value.fullName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      phone: this.signupForm.value.phone,
      role: 'USER' // Always set role to USER as specified
    };

    this.apiService.post('/api/auth/register', registerData)
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.isSubmitting = false;
          // Redirect to login page after successful registration
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        }
      });
  }

  // Helper methods for form validation
  get fullName() { return this.signupForm.get('fullName'); }
  get email() { return this.signupForm.get('email'); }
  get phone() { return this.signupForm.get('phone'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirm_password'); }
}
