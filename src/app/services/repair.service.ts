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

export interface RepairDetail {
  id: string;
  id_personne: string;
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
  detailServiceIds: string[];
  estimation: {
    cout_estime: number;
    temps_estime: number;
    details: {
      facteur_etat: number;
      coefficient_type: number;
    };
  };
  description: string;
  date_rdv: string;
  heure_rdv: string;
  deadline: string;
  images: string[];
  dateCreation: string;
  statut: RepairStatus;
  reference_paiement: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  services: {
    id: string;
    titre: string;
    description: string;
    icone: string;
    tachesParDefaut: any[];
    cout_base: number;
    temps_base: number;
    createdAt: string;
    updatedAt: string;
    pieces: any[];
  }[];
  taches: any[];
}

export interface RepairDetailResponse {
  data: {
    demande: RepairDetail;
  };
  error: null | string;
  status: number;
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

  getRepairDetail(id: string): Observable<RepairDetailResponse> {
    return this.http.get<RepairDetailResponse>(`${this.apiUrl}/${id}`);
  }
} 