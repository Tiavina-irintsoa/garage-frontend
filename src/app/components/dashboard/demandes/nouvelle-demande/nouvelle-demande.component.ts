import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehiculeFormComponent } from './steps/vehicule-form/vehicule-form.component';
import { ServicesFormComponent } from './steps/services-form/services-form.component';
import { DescriptionFormComponent } from './steps/description-form/description-form.component';
import { RendezVousFormComponent } from './steps/rendez-vous-form/rendez-vous-form.component';
import { NouvelleDemandService } from '../../../../services/nouvelle-demande.service';
import { DemandeFormData } from '../../../../models/demande.interface';

@Component({
  selector: 'app-nouvelle-demande',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VehiculeFormComponent,
    ServicesFormComponent,
    DescriptionFormComponent,
    RendezVousFormComponent,
  ],
  templateUrl: './nouvelle-demande.component.html',
  styleUrls: ['./nouvelle-demande.component.css'],
})
export class NouvelleDemandComponent implements OnInit {
  @ViewChild(VehiculeFormComponent) vehiculeForm!: VehiculeFormComponent;
  @ViewChild(ServicesFormComponent) servicesForm!: ServicesFormComponent;
  @ViewChild(DescriptionFormComponent)
  descriptionForm!: DescriptionFormComponent;
  @ViewChild(RendezVousFormComponent) rendezVousForm!: RendezVousFormComponent;

  currentStep: number = 1;
  totalSteps: number = 4;
  formData: DemandeFormData = {};

  steps = [
    { title: 'Informations véhicule', completed: false },
    { title: 'Services souhaités', completed: false },
    { title: 'Description du problème', completed: false },
    { title: 'Rendez-vous', completed: false },
  ];

  constructor(private nouvelleDemandService: NouvelleDemandService) {}

  ngOnInit() {
    this.nouvelleDemandService.formData$.subscribe((data) => {
      this.formData = data;
    });
  }

  onVehiculeFormComplete(vehiculeData: any) {
    console.log('Données reçues du formulaire :', vehiculeData);
  }

  nextStep(): void {
    const currentForm = this.getCurrentForm();
    if (currentForm) {
      currentForm.onSubmit();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onStepComplete(stepData: any): void {
    switch (this.currentStep) {
      case 1:
        this.nouvelleDemandService.updateVehiculeData(stepData);
        break;
      case 2:
        this.nouvelleDemandService.updateServicesData(stepData);
        break;
      case 3:
        // this.nouvelleDemandService.updateDescriptionData(stepData);
        break;
      case 4:
        this.nouvelleDemandService.updateRendezVousData(
          stepData.date,
          stepData.heure
        );
        break;
    }

    this.steps[this.currentStep - 1].completed = true;
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  private getCurrentForm(): any {
    switch (this.currentStep) {
      case 1:
        return this.vehiculeForm;
      case 2:
        return this.servicesForm;
      case 3:
        return this.descriptionForm;
      case 4:
        return this.rendezVousForm;
      default:
        return null;
    }
  }
}
