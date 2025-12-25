import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  showPassword: boolean = false;
  agreeToTerms: boolean = false;
  isLoginMode: boolean = true;
  superAdmin:any[]=[
    {
      email: 'superadmin@gmail.com',
      password: '12345678'
    },
    {
      email: 'super2@gmail.com',
      password: '123456'
    }
  ]
  // Firebase URLs
  private firebaseSignUpUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAAbwOCJ67SvhV1Rbq3wLdH35LVEbP51nk';
  private firebaseLoginUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAAbwOCJ67SvhV1Rbq3wLdH35LVEbP51nk';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.resetFields();
  }

  resetFields() {
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.showPassword = false;
    this.agreeToTerms = false;
  }

  //  Signup 
  onSignUp() {
    if (!this.agreeToTerms) {
      this.toastr.warning('Please agree to Terms & Conditions');
      return;
    }

    const signUpData = {
      email: this.email,
      password: this.password,
      returnSecureToken: true,
      displayName: `${this.firstName} ${this.lastName}`.trim()
    };

    this.http.post(this.firebaseSignUpUrl, signUpData).subscribe({
      next: (res: any) => {
        this.toastr.success('Signup Successful! Please login.');
        this.isLoginMode = true;
        this.resetFields();
      },
      error: (err) => {
        this.toastr.error(err.error.error.message || 'Signup failed');
      }
    });
  }

  //  Login 
  onLogin() {
    if (!this.email || !this.password) {
      this.toastr.warning('Please enter email and password');
      return;
    }

    const loginData = { email: this.email, password: this.password, returnSecureToken: true };

   this.http.post(this.firebaseLoginUrl, loginData).subscribe({
  next: (res: any) => {
    if (res.idToken) {
      localStorage.setItem('token', res.idToken);
      localStorage.setItem('uid', res.localId); 
      localStorage.setItem('email', this.email);
      const superAdmin = this.superAdmin;
      // Role assignment
      if (this.email === superAdmin[0].email || this.email === superAdmin[1].email) {
        localStorage.setItem('role', 'superadmin');
      } else {
        localStorage.setItem('role', 'vendor');
      }

      this.toastr.success('Login successful');
      this.router.navigate(['/dashboard']);
    }
  },
  error: (err) => {
    this.toastr.error(err.error.error.message || 'Login failed');
  }
 });

  }

  onFacebookLogin() {
   throw new Error('Method not implemented.');
  }
 onGoogleLogin() {
   throw new Error('Method not implemented.');
 } 

  //  Logout 
  logout() {
    localStorage.clear();
    localStorage.removeItem('token');
    this.toastr.success('Logged out successfully');
    this.router.navigate(['/login']);
  }
}
