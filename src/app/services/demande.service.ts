import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DemandesResponse } from '../models/demande.interface';

@Injectable({
  providedIn: 'root',
})
export class DemandeService {
  constructor(private http: HttpService) {}

  getUserDemandes(): Observable<DemandesResponse> {
    return this.http.authenticatedGet<DemandesResponse>('/demandes/user');
  }

  // Upload une seule image
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http.post<any>('/upload', formData).pipe(
      tap((response) => console.log('Upload response:', response)),
      map((response) => response.data.image.url)
    );
  }

  // Upload plusieurs images
  uploadImages(files: File[]): Observable<string[]> {
    console.log('Files to upload:', files);
    const uploadObservables = files.map((file) => this.uploadImage(file));
    return forkJoin(uploadObservables);
  }

  // Créer une nouvelle demande
  createDemande(formData: any, imageUrls: string[]): Observable<any> {
    const payload = {
      vehicule: formData.vehicule,
      liste_services: formData.services.map((s: any) => s.id),
      description: formData.description,
      date_rdv: formData.date_rdv,
      heure_rdv: formData.heure_rdv,
      deadline: formData.date_rdv, // Même date que le RDV
      photos: imageUrls,
    };

    console.log('Creating demande with payload:', payload);
    return this.http.authenticatedPost<any>('/demandes', payload);
  }

  // Méthode principale qui combine upload et création
  submitDemande(formData: any, files: File[]): Observable<any> {
    console.log('Submitting demande with files:', files);
    return this.uploadImages(files).pipe(
      tap((imageUrls) => console.log('Uploaded image URLs:', imageUrls)),
      switchMap((imageUrls) => this.createDemande(formData, imageUrls))
    );
  }
}
