import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Modele, ModeleResponse } from '../models/modele.interface';

@Injectable({
  providedIn: 'root',
})
export class ModeleService {
  private readonly endpoint = '/modeles';

  constructor(private http: HttpService) {}

  getModeles(): Observable<ModeleResponse> {
    return this.http.get<ModeleResponse>(this.endpoint);
  }

  createModele(modele: Modele): Observable<ModeleResponse> {
    return this.http.authenticatedPost<ModeleResponse>(this.endpoint, modele);
  }

  updateModele(id: string, modele: Modele): Observable<ModeleResponse> {
    return this.http.authenticatedPut<ModeleResponse>(
      `${this.endpoint}/${id}`,
      modele
    );
  }

  deleteModele(id: string): Observable<ModeleResponse> {
    return this.http.authenticatedDelete<ModeleResponse>(
      `${this.endpoint}/${id}`
    );
  }
}
