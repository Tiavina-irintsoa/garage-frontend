import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../../../services/service.service';
import { Service } from '../../../../models/service.interface';
import { ToastService } from '../../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';
import { IconPickerComponent } from '../../../../shared/icon-picker/icon-picker.component';

@Component({
  selector: 'app-gestion-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent, IconPickerComponent],
  templateUrl: './gestion-services.component.html',
  styleUrls: ['./gestion-services.component.scss'],
})
export class GestionServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  newService: Service = {
    titre: '',
    description: '',
    icone: '',
    cout_base: 0,
    temps_base: 0,
  };
  editingService: Service | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private serviceService: ServiceService,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.serviceService.getServices().subscribe({
      next: (response) => {
        this.services = response.data.services || [];
        this.filterAndPaginateServices();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des services';
        this.toast.error(this.error);
        this.isLoading = false;
      },
    });
  }

  filterAndPaginateServices(): void {
    let filtered = this.services;
    if (this.searchTerm) {
      filtered = this.services.filter(
        (service) =>
          service.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredServices = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.filterAndPaginateServices();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filterAndPaginateServices();
  }

  private isTitreExist(titre: string, excludeId?: string): boolean {
    return this.services.some(
      (service) =>
        service.titre.toLowerCase() === titre.toLowerCase() &&
        service.id !== excludeId
    );
  }

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR');
  }

  createService(): void {
    if (!this.newService.titre.trim()) {
      this.toast.error('Le titre est requis');
      return;
    }

    if (this.isTitreExist(this.newService.titre)) {
      this.toast.error('Ce service existe déjà');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.serviceService.createService(this.newService).subscribe({
      next: (response) => {
        if (response.data?.service) {
          this.services.push(response.data.service);
          this.filterAndPaginateServices();
          this.newService = {
            titre: '',
            description: '',
            icone: '',
            cout_base: 0,
            temps_base: 0,
          };
          this.toast.success('Service créé avec succès');
        } else {
          this.toast.error('Erreur: Réponse invalide du serveur');
        }
      },
      error: (error) => {
        this.error = 'Erreur lors de la création du service';
        this.toast.error(this.error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  startEdit(service: Service): void {
    this.editingService = { ...service };
  }

  cancelEdit(): void {
    this.editingService = null;
  }

  updateService(): void {
    if (!this.editingService || !this.editingService.id) return;

    if (this.isTitreExist(this.editingService.titre, this.editingService.id)) {
      this.toast.error('Ce service existe déjà');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.serviceService
      .updateService(this.editingService.id, this.editingService)
      .subscribe({
        next: (response) => {
          if (response.data?.service) {
            const index = this.services.findIndex(
              (s) => s.id === this.editingService?.id
            );
            if (index !== -1) {
              this.services[index] = response.data.service;
              this.filterAndPaginateServices();
            }
            this.editingService = null;
            this.toast.success('Service mis à jour avec succès');
          } else {
            this.toast.error('Erreur: Réponse invalide du serveur');
          }
        },
        error: (error) => {
          this.error = 'Erreur lors de la mise à jour du service';
          this.toast.error(this.error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  deleteService(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    this.isLoading = true;
    this.error = null;

    this.serviceService.deleteService(id).subscribe({
      next: () => {
        this.services = this.services.filter((s) => s.id !== id);
        this.filterAndPaginateServices();
        this.toast.success('Service supprimé avec succès');
      },
      error: (error) => {
        this.error = 'Erreur lors de la suppression du service';
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
