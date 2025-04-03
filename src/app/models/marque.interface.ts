export interface Marque {
  id?: string;
  libelle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MarqueResponse {
  data: {
    marque?: Marque;
    marques?: Marque[];
  };
  error: null | string;
  status: number;
}
