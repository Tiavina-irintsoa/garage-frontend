import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  // Requêtes publiques (sans token)
  public get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }

  public post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data);
  }

  public put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data);
  }

  public delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }

  // Requêtes authentifiées (avec token)
  public authenticatedGet<T>(endpoint: string): Observable<T> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Token non trouvé'));
    }

    return this.http
      .get<T>(`${this.apiUrl}${endpoint}`, {
        headers: this.getAuthHeaders(token),
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

  public authenticatedPost<T>(endpoint: string, data: any): Observable<T> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Token non trouvé'));
    }

    return this.http
      .post<T>(`${this.apiUrl}${endpoint}`, data, {
        headers: this.getAuthHeaders(token),
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

  public authenticatedPut<T>(endpoint: string, data: any): Observable<T> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Token non trouvé'));
    }

    return this.http
      .put<T>(`${this.apiUrl}${endpoint}`, data, {
        headers: this.getAuthHeaders(token),
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

  public authenticatedDelete<T>(endpoint: string): Observable<T> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Token non trouvé'));
    }

    return this.http
      .delete<T>(`${this.apiUrl}${endpoint}`, {
        headers: this.getAuthHeaders(token),
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

  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
}
