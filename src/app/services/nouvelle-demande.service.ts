import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Vehicule, Service } from '../models/demande.interface';

export interface DemandeFormData {
  vehicule?: Vehicule;
  services?: Service[];
  description?: string;
  date_rdv?: string;
  heure_rdv?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NouvelleDemandService {
  private formData = new BehaviorSubject<DemandeFormData>({});
  formData$ = this.formData.asObservable();

  updateVehiculeData(vehicule: Vehicule) {
    const currentData = this.formData.value;
    this.formData.next({ ...currentData, vehicule });
  }

  updateServicesData(services: Service[]) {
    const currentData = this.formData.value;
    this.formData.next({ ...currentData, services });
  }

  updateDescriptionData(description: string) {
    const currentData = this.formData.value;
    this.formData.next({ ...currentData, description });
  }

  updateRendezVousData(date: string, heure: string) {
    const currentData = this.formData.value;
    this.formData.next({
      ...currentData,
      date_rdv: date,
      heure_rdv: heure,
    });
  }

  resetForm() {
    this.formData.next({});
  }
}
