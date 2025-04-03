import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarqueService } from '../../../../services/marque.service';
import { Marque } from '../../../../models/marque.interface';
import { ToastService } from '../../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-gestion-marques',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './gestion-marques.component.html',
  styleUrls: ['./gestion-marques.component.scss'],
})
export class GestionMarquesComponent implements OnInit {
  marques: Marque[] = [];
  filteredMarques: Marque[] = [];
  newMarque: Marque = { libelle: '' };
  editingMarque: Marque | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private marqueService: MarqueService,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMarques();
  }

  loadMarques(): void {
    this.isLoading = true;
    this.marqueService.getMarques().subscribe({
      next: (response) => {
        this.marques = response.data.marques || [];
        this.filterAndPaginateMarques();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des marques';
        this.toast.error(this.error);
        this.isLoading = false;
      },
    });
  }

  filterAndPaginateMarques(): void {
    // Filtrer d'abord
    let filtered = this.marques;
    if (this.searchTerm) {
      filtered = this.marques.filter((marque) =>
        marque.libelle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Calculer le nombre total de pages
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    // Paginer ensuite
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredMarques = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1; // Réinitialiser à la première page
    this.filterAndPaginateMarques();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filterAndPaginateMarques();
  }

  private isLibelleExist(libelle: string, excludeId?: string): boolean {
    return this.marques.some(
      (marque) =>
        marque.libelle.toLowerCase() === libelle.toLowerCase() &&
        marque.id !== excludeId
    );
  }

  createMarque(): void {
    if (!this.newMarque.libelle.trim()) {
      this.toast.error('Le libellé est requis');
      return;
    }

    if (this.isLibelleExist(this.newMarque.libelle)) {
      this.toast.error('Cette marque existe déjà');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.marqueService.createMarque(this.newMarque).subscribe({
      next: (response) => {
        if (response.data?.marque) {
          this.marques.push(response.data.marque);
          this.filterAndPaginateMarques();
          this.newMarque = { libelle: '' };
          this.toast.success('Marque créée avec succès');
        } else {
          this.toast.error('Erreur: Réponse invalide du serveur');
        }
      },
      error: (error) => {
        this.error = 'Erreur lors de la création de la marque';
        this.toast.error(this.error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  startEdit(marque: Marque): void {
    this.editingMarque = { ...marque };
  }

  cancelEdit(): void {
    this.editingMarque = null;
  }

  updateMarque(): void {
    if (!this.editingMarque || !this.editingMarque.id) return;

    if (
      this.isLibelleExist(this.editingMarque.libelle, this.editingMarque.id)
    ) {
      this.toast.error('Cette marque existe déjà');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.marqueService
      .updateMarque(this.editingMarque.id, this.editingMarque)
      .subscribe({
        next: (response) => {
          if (response.data?.marque) {
            const index = this.marques.findIndex(
              (m) => m.id === this.editingMarque?.id
            );
            if (index !== -1) {
              this.marques[index] = response.data.marque;
              this.filterAndPaginateMarques();
            }
            this.editingMarque = null;
            this.toast.success('Marque mise à jour avec succès');
          } else {
            this.toast.error('Erreur: Réponse invalide du serveur');
          }
        },
        error: (error) => {
          this.error = 'Erreur lors de la mise à jour de la marque';
          this.toast.error(this.error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  deleteMarque(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) return;

    this.isLoading = true;
    this.error = null;

    this.marqueService.deleteMarque(id).subscribe({
      next: () => {
        this.marques = this.marques.filter((m) => m.id !== id);
        this.filterAndPaginateMarques();
        this.toast.success('Marque supprimée avec succès');
      },
      error: (error) => {
        this.error = 'Erreur lors de la suppression de la marque';
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
}
