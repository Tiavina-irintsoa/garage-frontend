import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { DemandesResponse } from '../models/demande.interface';

@Injectable({
  providedIn: 'root',
})
export class DemandeService {
  constructor(private http: HttpService) {}

  getUserDemandes(): Observable<DemandesResponse> {
    return this.http.authenticatedGet<DemandesResponse>('/demandes/user');
  }
}
