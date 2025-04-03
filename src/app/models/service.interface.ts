export interface Service {
  id?: string;
  titre: string;
  description: string;
  icone: string;
  cout_base: number;
  temps_base: number;
}

export interface ServiceResponse {
  success: boolean;
  message?: string;
  data: {
    service?: Service;
    services?: Service[];
  };
  error: string | null;
  status: number;
}
