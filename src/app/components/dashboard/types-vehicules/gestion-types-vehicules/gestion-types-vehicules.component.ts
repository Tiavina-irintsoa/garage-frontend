import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeVehiculeService } from '../../../../services/type-vehicule.service';
import { TypeVehicule } from '../../../../models/type-vehicule.interface';
import { ToastService } from '../../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-gestion-types-vehicules',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './gestion-types-vehicules.component.html',
  styleUrls: ['./gestion-types-vehicules.component.scss'],
})
export class GestionTypesVehiculesComponent implements OnInit {
  typesVehicules: TypeVehicule[] = [];
  filteredTypesVehicules: TypeVehicule[] = [];
  newTypeVehicule: TypeVehicule = {
    libelle: '',
    coefficient_estimation: 1.0,
    cout_moyen: 0,
    temps_moyen: 0,
  };
  editingTypeVehicule: TypeVehicule | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private typeVehiculeService: TypeVehiculeService,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTypesVehicules();
  }

  loadTypesVehicules(): void {
    this.isLoading = true;
    this.typeVehiculeService.getTypesVehicules().subscribe({
      next: (response) => {
        this.typesVehicules = response.data.types || [];
        this.filterAndPaginateTypesVehicules();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des types de véhicules';
        this.toast.error(this.error);
        this.isLoading = false;
      },
    });
  }

  filterAndPaginateTypesVehicules(): void {
    let filtered = this.typesVehicules;
    if (this.searchTerm) {
      filtered = this.typesVehicules.filter((type) =>
        type.libelle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredTypesVehicules = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.filterAndPaginateTypesVehicules();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filterAndPaginateTypesVehicules();
  }

  private isLibelleExist(libelle: string, excludeId?: string): boolean {
    return this.typesVehicules.some(
      (type) =>
        type.libelle.toLowerCase() === libelle.toLowerCase() &&
        type.id !== excludeId
    );
  }

  createTypeVehicule(): void {
    if (!this.newTypeVehicule.libelle.trim()) {
      this.toast.error('Le libellé est requis');
      return;
    }

    if (this.isLibelleExist(this.newTypeVehicule.libelle)) {
      this.toast.error('Ce type de véhicule existe déjà');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.typeVehiculeService
      .createTypeVehicule(this.newTypeVehicule)
      .subscribe({
        next: (response) => {
          if (response.data?.type) {
            this.typesVehicules.push(response.data.type);
            this.filterAndPaginateTypesVehicules();
            this.newTypeVehicule = {
              libelle: '',
              coefficient_estimation: 1.0,
              cout_moyen: 0,
              temps_moyen: 0,
            };
            this.toast.success('Type de véhicule créé avec succès');
          } else {
            this.toast.error('Erreur: Réponse invalide du serveur');
          }
        },
        error: (error) => {
          this.error = 'Erreur lors de la création du type de véhicule';
          this.toast.error(this.error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  startEdit(typeVehicule: TypeVehicule): void {
    this.editingTypeVehicule = { ...typeVehicule };
  }

  cancelEdit(): void {
    this.editingTypeVehicule = null;
  }

  updateTypeVehicule(): void {
    if (!this.editingTypeVehicule || !this.editingTypeVehicule.id) return;

    if (
      this.isLibelleExist(
        this.editingTypeVehicule.libelle,
        this.editingTypeVehicule.id
      )
    ) {
      this.toast.error('Ce type de véhicule existe déjà');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.typeVehiculeService
      .updateTypeVehicule(this.editingTypeVehicule.id, this.editingTypeVehicule)
      .subscribe({
        next: (response) => {
          if (response.data?.type) {
            const index = this.typesVehicules.findIndex(
              (t) => t.id === this.editingTypeVehicule?.id
            );
            if (index !== -1) {
              this.typesVehicules[index] = response.data.type;
              this.filterAndPaginateTypesVehicules();
            }
            this.editingTypeVehicule = null;
            this.toast.success('Type de véhicule mis à jour avec succès');
          } else {
            this.toast.error('Erreur: Réponse invalide du serveur');
          }
        },
        error: (error) => {
          this.error = 'Erreur lors de la mise à jour du type de véhicule';
          this.toast.error(this.error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  deleteTypeVehicule(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de véhicule ?'))
      return;

    this.isLoading = true;
    this.error = null;

    this.typeVehiculeService.deleteTypeVehicule(id).subscribe({
      next: (response) => {
        this.typesVehicules = this.typesVehicules.filter((t) => t.id !== id);
        this.filterAndPaginateTypesVehicules();
        this.toast.success('Type de véhicule supprimé avec succès');
      },
      error: (error) => {
        this.error = 'Erreur lors de la suppression du type de véhicule';
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

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR');
  }
}
