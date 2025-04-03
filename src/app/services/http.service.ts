import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    if (!isPlatformBrowser(this.platformId)) {
      return new HttpHeaders();
    }
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  get<T>(endpoint: string): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable();
    }
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable();
    }
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable();
    }
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable();
    }
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  authenticatedGet<T>(endpoint: string): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable();
    }
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  authenticatedPost<T>(endpoint: string, data: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable();
    }
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
    });
  }

  authenticatedPut<T>(endpoint: string, data: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Non disponible côté serveur'));
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Token non trouvé'));
    }

    return this.http
      .put<T>(`${this.apiUrl}${endpoint}`, data, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
  }

  authenticatedDelete<T>(endpoint: string): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Non disponible côté serveur'));
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Token non trouvé'));
    }

    return this.http
      .delete<T>(`${this.apiUrl}${endpoint}`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
  }
}
