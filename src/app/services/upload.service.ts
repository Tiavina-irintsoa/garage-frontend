import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImageDemande } from '../models/demande.interface';
import { environment } from '../../environments/environment';

interface CloudinaryResponse {
  data: {
    image: {
      url: string;
      public_id: string;
      format: string;
      width: number;
      height: number;
    };
  };
  error: null | string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<HttpEvent<CloudinaryResponse>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<CloudinaryResponse>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // Fonction utilitaire pour extraire les URLs d'images d'un contenu HTML
  extractImagesFromHtml(html: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = Array.from(doc.getElementsByTagName('img'));
    return images.map((img) => img.src);
  }

  // Fonction pour vérifier si une URL est une image Cloudinary
  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com');
  }

  // Fonction pour remplacer une URL locale par une URL Cloudinary dans le HTML
  replaceImageUrl(html: string, oldUrl: string, newUrl: string): string {
    return html.replace(new RegExp(oldUrl, 'g'), newUrl);
  }
}
