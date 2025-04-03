import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ServiceService } from '../../../../../../services/service.service';
import { Service } from '../../../../../../models/service.interface';
import { DemandeService } from '../../../../../../models/demande.interface';
import { NouvelleDemandService } from '../../../../../../services/nouvelle-demande.service';
import {
  EstimationService,
  EstimationResponse,
} from '../../../../../../services/estimation.service';
import { NumberFormatPipe } from '../../../../../../pipes/number-format.pipe';
import { ServiceResponse } from '../../../../../../models/service.interface';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NumberFormatPipe],
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.css'],
})
export class ServicesFormComponent implements OnInit {
  @Output() stepComplete = new EventEmitter<any>();
  @Input() currentStep: number = 2;
  @Output() previousStep = new EventEmitter<void>();

  servicesForm: FormGroup;
  services: Service[] = [];
  selectedServices: DemandeService[] = [];
  filteredServices: Service[] = [];
  isLoading = true;
  error: string | null = null;
  estimation: EstimationResponse['data']['estimation'] | null = null;
  isLoadingEstimation = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private nouvelleDemandService: NouvelleDemandService,
    private estimationService: EstimationService
  ) {
    this.servicesForm = this.fb.group({
      searchService: [''],
    });

    // Écouter les changements de recherche
    this.servicesForm.get('searchService')?.valueChanges.subscribe((value) => {
      this.filterServices(value);
    });
  }

  ngOnInit(): void {
    this.serviceService.getServices().subscribe({
      next: (response: ServiceResponse) => {
        if (response.data?.services) {
          this.services = response.data.services;
          this.filteredServices = response.data.services;
          this.isLoading = false;
        }
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des services:', error);
        this.isLoading = false;
      },
    });

    // S'abonner aux données du formulaire
    this.nouvelleDemandService.formData$.subscribe((data) => {
      if (data.services) {
        this.selectedServices = data.services;
        if (data.vehicule) {
          this.updateEstimation(
            data.vehicule.type.id,
            data.vehicule.etatVehicule
          );
        }
      }
    });
  }

  private updateEstimation(typeVehiculeId: string, etatVehicule: string): void {
    if (this.selectedServices.length === 0) {
      this.estimation = null;
      return;
    }
    console.log('update estimation');
    this.isLoadingEstimation = true;
    const serviceIds = this.selectedServices.map((service) => service.id);

    this.estimationService
      .getEstimationDetails(serviceIds, typeVehiculeId, etatVehicule)
      .subscribe({
        next: (response) => {
          console.log(response.data);
          this.estimation = response.data.estimation;
          this.isLoadingEstimation = false;
        },
        error: (error) => {
          console.error("Erreur lors du calcul de l'estimation", error);
          this.isLoadingEstimation = false;
        },
      });
  }

  private filterServices(value: string): void {
    if (!value) {
      this.filteredServices = this.services.filter(
        (service) =>
          !this.selectedServices.find((s) => s.titre === service.titre)
      );
      return;
    }

    this.filteredServices = this.services.filter(
      (service) =>
        service.titre.toLowerCase().includes(value.toLowerCase()) &&
        !this.selectedServices.find((s) => s.titre === service.titre)
    );
  }

  addService(service: Service): void {
    if (!service.id) return;

    const demandeService: DemandeService = {
      id: service.id,
      titre: service.titre,
      description: service.description,
      icone: service.icone,
    };
    this.selectedServices.push(demandeService);
    this.servicesForm.get('searchService')?.setValue('');
    this.error = null;

    // Mettre à jour l'estimation
    this.nouvelleDemandService.formData$
      .subscribe((data) => {
        if (data.vehicule) {
          console.log('update estimation');
          this.updateEstimation(
            data.vehicule.type.id,
            data.vehicule.etatVehicule
          );
          console.log('nouvelle estimation', this.estimation);
        }
      })
      .unsubscribe();
  }

  removeService(service: DemandeService): void {
    this.selectedServices = this.selectedServices.filter(
      (s) => s.titre !== service.titre
    );

    // Mettre à jour l'estimation
    this.nouvelleDemandService.formData$
      .subscribe((data) => {
        if (data.vehicule) {
          this.updateEstimation(
            data.vehicule.type.id,
            data.vehicule.etatVehicule
          );
        }
      })
      .unsubscribe();
  }

  onSubmit(): void {
    if (this.selectedServices.length === 0) {
      this.error = 'Veuillez sélectionner au moins un service';
      return;
    }
    this.error = null;
    this.stepComplete.emit(this.selectedServices);
  }

  onPreviousStep(): void {
    // Sauvegarder les services sélectionnés avant de naviguer
    this.nouvelleDemandService.updateServicesData(this.selectedServices);
    this.previousStep.emit();
  }
}
