import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token'); 

    if (token) {
      //  User logged in
      return true;
    } else {
      //  Not logged in — redirect to login page
      this.router.navigate(['/login']);
      return false;
    }
  }
}
