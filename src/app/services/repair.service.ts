import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';

export type RepairStatus =
  | 'ATTENTE_ASSIGNATION'
  | 'ATTENTE_FACTURATION'
  | 'PAYE'
  | 'EN_COURS'
  | 'TERMINEE';

export interface Repair {
  id: string;
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
  reference_paiement: string | null;
  pieces_facture: Array<{
    id: string;
    prix: number;
    quantite: number;
    reference?: string;
    nom?: string;
    description?: string;
  }>;
  montant_pieces: number | null;
  montant_total: number | null;
  date_facturation: string | null;
  photos: string[];
  client: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  statut: string;
}

export interface RepairResponse {
  data: {
    demandes: Repair[];
  };
  error: any;
  status: number;
}

export interface RepairDetail {
  id: string;
  client: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  vehicule: {
    id: string;
    immatriculation: string;
    marque: {
      id: string;
      libelle: string;
    };
    modele: {
      id: string;
      libelle: string;
    };
  };
  date_rdv: string;
  description: string;
  deadline: string;
  estimation: {
    cout_estime: number;
    details: {
      coefficient_type: number;
      facteur_etat: number;
    };
  };
  services: Array<{
    id: string;
    titre: string;
    temps_base: number;
    cout_base: number;
  }>;
  pieces_facture?: Array<{
    id: string;
    reference?: string;
    nom?: string;
    description?: string;
    prix: number;
    quantite: number;
  }>;
  montant_pieces?: number;
  montant_total?: number;
  date_facturation?: string;
  reference_paiement?: string;
  statut?: RepairStatus;
}

export interface RepairDetailResponse {
  data: {
    demande: RepairDetail;
  };
  error: null | string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class RepairService {
  private apiUrl = `${environment.apiUrl}/demandes`;

  constructor(private http: HttpClient, private httpService: HttpService) {}

  getRepairsByStatus(status: RepairStatus): Observable<RepairResponse> {
    return this.http.get<RepairResponse>(`${this.apiUrl}/status/${status}`);
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

  updateRepairBill(
    repairId: string,
    pieces: { id: string; prix: number; quantite: number }[]
  ): Observable<any> {
    return this.httpService.authenticatedPost(`/demandes/${repairId}/facture`, {
      pieces,
    });
  }
}
