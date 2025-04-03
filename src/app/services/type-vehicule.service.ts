import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import {
  TypeVehicule,
  TypeVehiculeResponse,
} from '../models/type-vehicule.interface';

@Injectable({
  providedIn: 'root',
})
export class TypeVehiculeService {
  private apiUrl = `/types-vehicules`;

  constructor(private http: HttpService) {}

  getTypesVehicules(): Observable<TypeVehiculeResponse> {
    return this.http.get<TypeVehiculeResponse>(this.apiUrl);
  }

  createTypeVehicule(
    typeVehicule: TypeVehicule
  ): Observable<TypeVehiculeResponse> {
    return this.http.authenticatedPost<TypeVehiculeResponse>(
      this.apiUrl,
      typeVehicule
    );
  }

  updateTypeVehicule(
    id: string,
    typeVehicule: TypeVehicule
  ): Observable<TypeVehiculeResponse> {
    return this.http.authenticatedPut<TypeVehiculeResponse>(
      `${this.apiUrl}/${id}`,
      typeVehicule
    );
  }

  deleteTypeVehicule(id: string): Observable<TypeVehiculeResponse> {
    return this.http.authenticatedDelete<TypeVehiculeResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}
