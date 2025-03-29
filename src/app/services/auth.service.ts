import {
  afterNextRender,
  inject,
  PLATFORM_ID,
  Injectable,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from './http.service';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  VerifyEmailCredentials,
} from '../models/user.interface';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private platformId = inject(PLATFORM_ID);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpService, private httpClient: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthStatus();
      const token = localStorage.getItem('access_token');
      this.isAuthenticatedSubject.next(!!token);
    }    
  }

  private checkAuthStatus(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = this.getStorageItem('token');
    const user = this.getUserFromStorage();

    if (token && user) {
      this.currentUserSubject.next(user);
    } else {
      this.logout();
    }
  }

  private getUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const userStr = this.getStorageItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private setUserInStorage(user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.setStorageItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Méthodes sécurisées pour accéder au localStorage
  private getStorageItem(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(key);
  }

  private setStorageItem(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(key, value);
  }

  private removeStorageItem(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(key);
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
          this.setStorageItem('token', response.data.token);

          if (response.data.user) {
            this.setUserInStorage(response.data.user);
          } else {
            const tokenData = this.getTokenData(response.data.token);
            if (tokenData?.userId) {
              this.fetchUserDetails(tokenData.userId);
            }
          }
        }
      })
    );
  }

  private fetchUserDetails(userId: string): void {
    this.http
      .authenticatedGet<{ data: { user: User } }>(`/auth/users/${userId}`)
      .subscribe({
        next: (response) => {
          this.setUserInStorage(response.data.user);
        },
        error: (error) => {
          console.error(
            'Erreur lors de la récupération des détails utilisateur:',
            error
          );
          this.logout();
        },
      });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.removeStorageItem('token');
      this.removeStorageItem('user');
    }
    this.currentUserSubject.next(null);
    localStorage.removeItem('access_token');
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!this.currentUserSubject.value && !!this.getStorageItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  initiateGoogleLogin(): void {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?
      client_id=${environment.googleClientId}&
      response_type=code&
      scope=openid profile email&
      redirect_uri=${encodeURIComponent(environment.redirectUri)}&
      access_type=offline&
      prompt=consent`;
    
    const cleanUrl = googleAuthUrl.replace(/\s+/g, '');
    window.location.href = cleanUrl;
  }

  handleGoogleCallback(code: string): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/auth/google/callback`, { code });
  }

  setAuthenticated(token: string): void {
    localStorage.setItem('access_token', token);
    this.isAuthenticatedSubject.next(true);
  }
}
