// Types de base
export interface Marque {
  id: string;
  libelle: string;
}

export interface Modele {
  id: string;
  libelle: string;
}

export interface TypeVehicule {
  id: string;
  libelle: string;
  coefficient_estimation: number;
  cout_moyen: number;
  temps_moyen: number;
}

export type EtatVehicule = 'NEUF' | 'USE' | 'TRES_USE';

export interface Vehicule {
  marque: Marque;
  modele: Modele;
  couleur: string;
  type: TypeVehicule;
  immatriculation: string;
  etatVehicule: EtatVehicule;
}

// Interface pour les images
export interface ImageDemande {
  url: string;
  nom: string;
  type: string;
  taille: number;
  dateUpload: string;
}

// Interfaces pour les réponses API
export interface MarquesResponse {
  data: {
    marques: Marque[];
  };
  error: null | string;
  status: number;
}

export interface ModelesResponse {
  data: {
    modeles: Modele[];
  };
  error: null | string;
  status: number;
}

export interface TypesVehiculesResponse {
  data: {
    types: TypeVehicule[];
  };
  error: null | string;
  status: number;
}

// Structure pour le formulaire de véhicule
export interface VehiculeFormData {
  marque: Marque;
  modele: Modele;
  couleur: string;
  type: TypeVehicule;
  immatriculation: string;
  etatVehicule: EtatVehicule;
}

// Structure pour la demande complète
export interface DemandeService {
  id: string;
  titre: string;
  description: string;
  icone: string;
}

export interface Estimation {
  cout_estime: number;
  temps_estime: number;
  details: {
    facteur_etat: number;
    coefficient_type: number;
  };
}

export interface Demande {
  id: string;
  vehicule: Vehicule;
  services: DemandeService[];
  estimation: Estimation;
  description: string;
  description_html: string; // Contenu HTML enrichi
  images: ImageDemande[]; // Liste des images associées
  photos: string[]; // URLs des photos uploadées
  statut: string;
  dateCreation: string;
  date_rdv: string;
  heure_rdv: string;
}

export interface DemandesResponse {
  data: {
    demandes: Demande[];
  };
  error: null | string;
  status: number;
}

// Ajout de l'interface pour le formulaire
export interface DemandeFormData {
  vehicule?: Vehicule;
  services?: DemandeService[];
  description?: string;
  description_html?: string;
  images?: ImageDemande[];
  date_rdv?: string;
  heure_rdv?: string;
}
