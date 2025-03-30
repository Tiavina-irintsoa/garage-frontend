import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import {
  MarquesResponse,
  ModelesResponse,
  TypesVehiculesResponse,
} from '../models/demande.interface';

@Injectable({
  providedIn: 'root',
})
export class VehiculeService {
  constructor(private http: HttpService) {}

  getMarques(): Observable<MarquesResponse> {
    return this.http.get<MarquesResponse>('/marques');
  }

  getModelesByMarque(marqueId: string): Observable<ModelesResponse> {
    return this.http.get<ModelesResponse>(`/marques/${marqueId}/modeles`);
  }

  getTypesVehicules(): Observable<TypesVehiculesResponse> {
    return this.http.get<TypesVehiculesResponse>('/types-vehicules');
  }
}
