import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface FirebaseAuthResponse {
  idToken?: string;
  localId?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebaseApiKey = 'AIzaSyAAbwOCJ67SvhV1Rbq3wLdH35LVEbP51nk';
  private signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.firebaseApiKey}`;
  private loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.firebaseApiKey}`;

  // basic auth state observable (optional)
  private _isAuthenticated = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(private http: HttpClient) {}

  signUp(email: string, password: string, displayName?: string): Observable<FirebaseAuthResponse> {
    return this.http.post<FirebaseAuthResponse>(this.signUpUrl, {
      email,
      password,
      returnSecureToken: true,
      displayName,
    });
  }

  login(email: string, password: string): Observable<FirebaseAuthResponse> {
    return this.http.post<FirebaseAuthResponse>(this.loginUrl, {
      email,
      password,
      returnSecureToken: true,
    }).pipe(
      tap((res) => {
        if (res && res.idToken) {
          localStorage.setItem('token', res.idToken);
          localStorage.setItem('uid', res.localId || '');
          localStorage.setItem('email', email);
          this._isAuthenticated.next(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this._isAuthenticated.next(false);
  }
}
