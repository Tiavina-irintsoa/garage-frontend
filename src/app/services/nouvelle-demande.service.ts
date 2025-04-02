import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Vehicule,
  DemandeService as Service,
  ImageDemande,
  DemandeFormData as BaseDemandeFormData,
} from '../models/demande.interface';

interface DemandeFormData extends BaseDemandeFormData {
  _tempFiles?: {
    files: File[];
    pondFiles: any[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class NouvelleDemandService {
  private formData = new BehaviorSubject<DemandeFormData>({});
  formData$ = this.formData.asObservable();

  getFormData() {
    return this.formData.value;
  }

  updateVehiculeData(vehicule: Vehicule) {
    const currentData = this.formData.value;
    this.formData.next({ ...currentData, vehicule });
  }

  clearTempFiles() {
    const currentData = this.formData.value;
    const { _tempFiles, ...restData } = currentData;
    this.formData.next(restData);
  }

  updateServicesData(services: Service[]) {
    const currentData = this.formData.value;
    this.formData.next({ ...currentData, services });
  }

  updateDescriptionData(description: string) {
    console.log('description :', description);
    const currentData = this.formData.value;
    this.formData.next({ ...currentData, description });
    console.log('description mise à jour:', this.formData.value);
  }

  updateImagesData(files: File[], pondFiles: any[]) {
    const currentData = this.formData.value;
    const images: ImageDemande[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      nom: file.name,
      type: file.type,
      taille: file.size,
      dateUpload: new Date().toISOString(),
    }));

    this.formData.next({
      ...currentData,
      images,
      _tempFiles: { files, pondFiles }, // Stockage temporaire des fichiers originaux
    });
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
    // Nettoyer les URLs des objets avant de réinitialiser
    const currentData = this.formData.value;
    if (currentData.images) {
      currentData.images.forEach((image) => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    }
    this.formData.next({});
  }
}
