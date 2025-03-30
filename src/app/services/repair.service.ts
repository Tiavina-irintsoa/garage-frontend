import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type RepairStatus = 'ATTENTE_ASSIGNATION' | 'ATTENTE_FACTURATION' | 'PAYE' | 'EN_COURS' | 'TERMINEE';

export interface Repair {
  id: string;
  deadline: string;
  date_rdv: string;
  heure_rdv: string;
  vehicule: {
    marque: {
      id: string;
      libelle: string;
    };
    modele: {
      id: string;
      libelle: string;
    };
    couleur: string;
    type: {
      id: string;
      libelle: string;
    };
    immatriculation: string;
    etatVehicule: string;
  };
  description: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  detailServiceIds: string[];
  estimation: {
    cout_estime: number;
    temps_estime: number;
    details: {
      facteur_etat: number;
      coefficient_type: number;
    };
  };
  images: string[];
  reference_paiement: string;
}

@Injectable({
  providedIn: 'root'
})
export class RepairService {
  private apiUrl = `${environment.apiUrl}/demandes`;

  constructor(private http: HttpClient) {}

  getRepairsByStatus(status: RepairStatus): Observable<Repair[]> {
    return this.http.get<Repair[]>(`${this.apiUrl}/status/${status}`);
  }

  getAllRepairs(): Observable<Repair[]> {
    return this.http.get<Repair[]>(this.apiUrl);
  }

  getRepairById(id: string): Observable<Repair> {
    return this.http.get<Repair>(`${this.apiUrl}/${id}`);
  }

  updateRepairStatus(id: string, status: RepairStatus): Observable<Repair> {
    return this.http.patch<Repair>(`${this.apiUrl}/${id}/status`, { status });
  }
} 