import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

export interface EstimationResponse {
  data: {
    estimation: {
      cout_estime: number;
      temps_estime: number;
      details: {
        type_vehicule: {
          libelle: string;
          coefficient_estimation: number;
        };
        etat_vehicule: {
          etat: string;
          facteur_etat: number;
        };
        services: Array<{
          service: {
            id: string;
            titre: string;
            cout_base: number;
            temps_base: number;
          };
        }>;
      };
    };
  };
  error: string | null;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class EstimationService {
  constructor(private http: HttpService) {}

  getEstimationDetails(
    serviceIds: string[],
    typeVehiculeId: string,
    etatVehicule: string
  ): Observable<EstimationResponse> {
    return this.http.authenticatedPost<EstimationResponse>(
      '/estimations/details',
      {
        services: serviceIds,
        type_vehicule_id: typeVehiculeId,
        etat_vehicule: etatVehicule,
      }
    );
  }
}
