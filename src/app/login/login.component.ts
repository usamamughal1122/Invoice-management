import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
 // Existing properties
  email: string = '';
  password: string = '';
  isLoginMode: boolean = true;

  // NEW properties for the UI
  firstName: string = '';
  lastName: string = '';
  showPassword: boolean = false;
  agreeToTerms: boolean = false;

  // Firebase URLs
  private firebaseSignUpUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAAbwOCJ67SvhV1Rbq3wLdH35LVEbP51nk';
  private firebaseLoginUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAAbwOCJ67SvhV1Rbq3wLdH35LVEbP51nk';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private toastr: ToastrService
  ) {}

  // Toggle Login / Signup form
  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.resetFields();
  }

  // Reset input fields
  resetFields() {
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.showPassword = false;
    this.agreeToTerms = false;
  }

  //  Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Signup
  onSignUp() {
    // Validate terms checkbox
    if (!this.agreeToTerms) {
      this.toastr.warning('Please agree to the Terms & Conditions');
      return;
    }

    const signUpData = {
      email: this.email,
      password: this.password,
      returnSecureToken: true,
      // You can store firstName and lastName in Firebase Realtime Database separately
      displayName: `${this.firstName} ${this.lastName}`.trim()
    };

    this.http.post(this.firebaseSignUpUrl, signUpData).subscribe({
      next: (res: any) => {
        this.toastr.success('Signup Successful! Please login.');
        this.resetFields();
        this.isLoginMode = true;
      },
      error: (err) => {
        this.toastr.error(err.error.error.message || 'Signup failed');
      }
    });
  }

  // Login
  onLogin() {
    const loginData = {
      email: this.email,
      password: this.password,
      returnSecureToken: true
    };

    this.http.post(this.firebaseLoginUrl, loginData).subscribe({
      next: (res: any) => {
        if (res.idToken) {
          localStorage.setItem('token', res.idToken);
          this.toastr.success('Login successful');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.toastr.error(err.error.error.message || 'Login failed');
      }
    });
  }

 
  onGoogleLogin() {
    this.toastr.info('Google login will be implemented');
    console.log('Google login clicked');
  }


  onFacebookLogin() {
    this.toastr.info('Facebook login will be implemented');
    console.log('Facebook login clicked');
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.toastr.success('Logged out successfully');
  }
}
