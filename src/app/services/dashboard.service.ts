import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, map } from 'rxjs';

interface DashboardResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

interface ServicesPerformanceResponse {
  services: {
    id: string;
    titre: string;
    pourcentage: string;
  }[];
}

interface ChiffreAffaireResponse {
  chiffreAffaire: number[];
}

interface InscriptionsResponse {
  inscriptions: number[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpService) {}

  getServicesPerformance(
    annee: number
  ): Observable<ServicesPerformanceResponse> {
    return this.http
      .authenticatedGet<DashboardResponse<ServicesPerformanceResponse>>(
        `/dashboard/services-plus-demandes?annee=${annee}`
      )
      .pipe(map((response) => response.data));
  }

  getChiffreAffaire(annee: number): Observable<ChiffreAffaireResponse> {
    return this.http
      .authenticatedGet<DashboardResponse<ChiffreAffaireResponse>>(
        `/dashboard/chiffre-affaire?annee=${annee}`
      )
      .pipe(map((response) => response.data));
  }

  getInscriptions(annee: number): Observable<InscriptionsResponse> {
    return this.http
      .authenticatedGet<DashboardResponse<InscriptionsResponse>>(
        `/dashboard/inscriptions?annee=${annee}`
      )
      .pipe(map((response) => response.data));
  }
}
