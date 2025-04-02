import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandeService } from '../../../../services/demande.service';
import { Demande } from '../../../../models/demande.interface';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mes-demandes.component.html',
  styleUrls: ['./mes-demandes.css'],
})
export class MesDemandesComponent implements OnInit {
  demandes: Demande[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentPhoto: string | null = null;

  constructor(private demandeService: DemandeService) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  private loadDemandes(): void {
    this.demandeService.getUserDemandes().subscribe({
      next: (response) => {
        this.demandes = response.data.demandes;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des demandes';
        this.isLoading = false;
      },
    });
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTE':
        return 'bg-green-100 text-green-800';
      case 'REFUSE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  openPhotoViewer(photoUrl: string): void {
    this.currentPhoto = photoUrl;
  }

  closePhotoViewer(): void {
    this.currentPhoto = null;
  }
}
