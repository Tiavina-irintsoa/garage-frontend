import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { HttpService } from './http.service';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  VerifyEmailCredentials,
} from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthStatus();
    }
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenData = this.getTokenData(token);
      if (tokenData?.userId) {
        this.fetchUserDetails(tokenData.userId);
      }
    }
  }

  private fetchUserDetails(userId: string): void {
    this.http
      .authenticatedGet<{ data: { user: User } }>(`/auth/users/${userId}`)
      .subscribe({
        next: (response) => {
          this.currentUserSubject.next(response.data.user);
        },
        error: (error) => {
          console.error(
            'Erreur lors de la récupération des détails utilisateur:',
            error
          );
        },
      });
  }

  private getTokenData(token: string): { userId: string; role: string } | null {
    try {
      const parts = token.split('.');
      const payloadBase64 = parts[1];
      const payload = JSON.parse(atob(payloadBase64));
      return {
        userId: payload.userId,
        role: payload.role,
      };
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/register', credentials);
  }

  verifyEmail(verifyData: VerifyEmailCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/verify', verifyData);
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        if (response.data.token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.data.token);
          const tokenData = this.getTokenData(response.data.token);
          if (tokenData?.userId) {
            this.fetchUserDetails(tokenData.userId);
          }
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }
}
