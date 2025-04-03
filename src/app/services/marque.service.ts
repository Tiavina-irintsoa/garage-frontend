import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { Marque, MarqueResponse } from '../models/marque.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarqueService {
  private apiUrl = `/marques`;

  constructor(private http: HttpService) {}

  getMarques(): Observable<MarqueResponse> {
    return this.http.get<MarqueResponse>(this.apiUrl);
  }

  createMarque(marque: Marque): Observable<MarqueResponse> {
    return this.http.authenticatedPost<MarqueResponse>(this.apiUrl, marque);
  }

  updateMarque(id: string, marque: Marque): Observable<MarqueResponse> {
    return this.http.authenticatedPut<MarqueResponse>(
      `${this.apiUrl}/${id}`,
      marque
    );
  }

  deleteMarque(id: string): Observable<MarqueResponse> {
    return this.http.authenticatedDelete<MarqueResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}
