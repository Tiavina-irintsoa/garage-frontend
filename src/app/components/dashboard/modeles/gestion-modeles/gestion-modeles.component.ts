import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModeleService } from '../../../../services/modele.service';
import { MarqueService } from '../../../../services/marque.service';
import { Modele } from '../../../../models/modele.interface';
import { Marque } from '../../../../models/marque.interface';
import { ToastService } from '../../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-gestion-modeles',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './gestion-modeles.component.html',
  styleUrls: ['./gestion-modeles.component.scss'],
})
export class GestionModelesComponent implements OnInit {
  modeles: Modele[] = [];
  marques: Marque[] = [];
  filteredModeles: Modele[] = [];
  newModele: Modele = { libelle: '', marqueId: '' };
  editingModele: Modele | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private modeleService: ModeleService,
    private marqueService: MarqueService,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadModeles();
    this.loadMarques();
  }

  loadModeles(): void {
    this.isLoading = true;
    this.modeleService.getModeles().subscribe({
      next: (response) => {
        this.modeles = response.data.modeles || [];
        this.filterAndPaginateModeles();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des modèles';
        this.toast.error(this.error);
        this.isLoading = false;
      },
    });
  }

  loadMarques(): void {
    this.marqueService.getMarques().subscribe({
      next: (response) => {
        this.marques = response.data.marques || [];
      },
      error: (error) => {
        this.toast.error('Erreur lors du chargement des marques');
      },
    });
  }

  filterAndPaginateModeles(): void {
    let filtered = this.modeles;
    if (this.searchTerm) {
      filtered = this.modeles.filter((modele) =>
        modele.libelle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredModeles = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.filterAndPaginateModeles();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filterAndPaginateModeles();
  }

  private isLibelleExist(
    libelle: string,
    marqueId: string,
    excludeId?: string
  ): boolean {
    return this.modeles.some(
      (modele) =>
        modele.libelle.toLowerCase() === libelle.toLowerCase() &&
        modele.marqueId === marqueId &&
        modele.id !== excludeId
    );
  }

  createModele(): void {
    if (!this.newModele.libelle.trim()) {
      this.toast.error('Le libellé est requis');
      return;
    }

    if (!this.newModele.marqueId) {
      this.toast.error('La marque est requise');
      return;
    }

    if (this.isLibelleExist(this.newModele.libelle, this.newModele.marqueId)) {
      this.toast.error('Ce modèle existe déjà pour cette marque');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.modeleService.createModele(this.newModele).subscribe({
      next: (response) => {
        if (response.data?.modele) {
          this.modeles.push(response.data.modele);
          this.filterAndPaginateModeles();
          this.newModele = { libelle: '', marqueId: '' };
          this.toast.success('Modèle créé avec succès');
        } else {
          this.toast.error('Erreur: Réponse invalide du serveur');
        }
      },
      error: (error) => {
        this.error = 'Erreur lors de la création du modèle';
        this.toast.error(this.error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  startEdit(modele: Modele): void {
    this.editingModele = { ...modele };
  }

  cancelEdit(): void {
    this.editingModele = null;
  }

  updateModele(): void {
    if (!this.editingModele || !this.editingModele.id) return;

    if (
      this.isLibelleExist(
        this.editingModele.libelle,
        this.editingModele.marqueId,
        this.editingModele.id
      )
    ) {
      this.toast.error('Ce modèle existe déjà pour cette marque');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.modeleService
      .updateModele(this.editingModele.id, this.editingModele)
      .subscribe({
        next: (response) => {
          if (response.data?.modele) {
            const index = this.modeles.findIndex(
              (m) => m.id === this.editingModele?.id
            );
            if (index !== -1) {
              this.modeles[index] = response.data.modele;
              this.filterAndPaginateModeles();
            }
            this.editingModele = null;
            this.toast.success('Modèle mis à jour avec succès');
          } else {
            this.toast.error('Erreur: Réponse invalide du serveur');
          }
        },
        error: (error) => {
          this.error = 'Erreur lors de la mise à jour du modèle';
          this.toast.error(this.error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  deleteModele(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;

    this.isLoading = true;
    this.error = null;

    this.modeleService.deleteModele(id).subscribe({
      next: () => {
        this.modeles = this.modeles.filter((m) => m.id !== id);
        this.filterAndPaginateModeles();
        this.toast.success('Modèle supprimé avec succès');
      },
      error: (error) => {
        this.error = 'Erreur lors de la suppression du modèle';
        this.toast.error(this.error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getMarqueLibelle(marqueId: string): string {
    return this.marques.find((m) => m.id === marqueId)?.libelle || '';
  }
}
