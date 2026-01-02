import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

type LoginResponse = { token: string };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private apiUrl = `${environment.apiUrl}/auth`;

  isAuthenticated = signal(false);
  userName = signal('');

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map((res) => (res?.token ?? '').trim()),
        tap((token) => {
          if (token) {
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem('userName', username);
            this.isAuthenticated.set(true);
            this.loadCurrentUser();
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.userName.set('');
    this.router.navigate(['/auth/login']);
  }

  loadCurrentUser() {
    const token = this.getToken();
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<User>(`${this.apiUrl}/me`, { headers })
      .pipe(
        catchError(() => of(null))
      )
      .subscribe(user => {
        if (user) {
          this.isAuthenticated.set(true);
          this.userName.set(user.username);
        } else {
          this.isAuthenticated.set(false);
          this.userName.set('');
        }
      });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }
  
}
