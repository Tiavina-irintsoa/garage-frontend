export interface TypeVehicule {
  id?: string;
  libelle: string;
  coefficient_estimation: number;
  cout_moyen: number;
  temps_moyen: number;
}

export interface TypeVehiculeResponse {
  data: {
    types?: TypeVehicule[];
    type?: TypeVehicule;
  };
  error: null | string;
  status: number;
}
