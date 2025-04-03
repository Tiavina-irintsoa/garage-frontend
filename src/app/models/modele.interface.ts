export interface Modele {
  id?: string;
  libelle: string;
  marqueId: string;
  marque?: {
    id: string;
    libelle: string;
  };
}

export interface ModeleResponse {
  success: boolean;
  message?: string;
  data: {
    modele?: Modele;
    modeles?: Modele[];
  };
}
