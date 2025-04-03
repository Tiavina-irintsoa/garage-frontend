import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NouvelleDemandService } from '../../../../../../services/nouvelle-demande.service';
import { DemandeService } from '../../../../../../services/demande.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rendez-vous-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rendez-vous-form.component.html',
  styleUrls: ['./rendez-vous-form.component.scss'],
})
export class RendezVousFormComponent implements OnInit {
  @Output() stepComplete = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();
  @Input() currentStep: number = 4;

  date_rdv: string = '';
  heure_rdv: string = '';
  error: string | null = null;
  isValid: boolean = false;
  isSubmitting: boolean = false;

  // Date minimum (aujourd'hui)
  minDate: string = new Date().toISOString().split('T')[0];

  // Date maximum (3 mois à partir d'aujourd'hui)
  maxDate: string = new Date(new Date().setMonth(new Date().getMonth() + 3))
    .toISOString()
    .split('T')[0];

  constructor(
    private nouvelleDemandService: NouvelleDemandService,
    private demandeService: DemandeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer les données sauvegardées si elles existent
    this.nouvelleDemandService.formData$.subscribe((data) => {
      if (data.date_rdv) {
        this.date_rdv = data.date_rdv;
      }
      if (data.heure_rdv) {
        this.heure_rdv = data.heure_rdv;
      }
      this.validateForm();
    });
  }

  onDateChange(value: string): void {
    this.date_rdv = value;
    this.validateForm();
  }

  onHeureChange(value: string): void {
    this.heure_rdv = value;
    this.validateForm();
  }

  validateForm(): void {
    this.isValid =
      this.date_rdv.trim().length > 0 && this.heure_rdv.trim().length > 0;

    if (!this.date_rdv) {
      this.error = 'La date du rendez-vous est requise';
      return;
    }

    if (!this.heure_rdv) {
      this.error = "L'heure du rendez-vous est requise";
      return;
    }

    // Vérifier que la date n'est pas dans le passé
    const selectedDate = new Date(this.date_rdv);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.error = 'La date ne peut pas être dans le passé';
      this.isValid = false;
      return;
    }

    // Vérifier que l'heure est entre 8h et 18h
    const [hours] = this.heure_rdv.split(':').map(Number);
    if (hours < 8 || hours >= 18) {
      this.error = 'Les rendez-vous sont possibles entre 8h et 18h';
      this.isValid = false;
      return;
    }

    this.error = null;
  }

  onSubmit(): void {
    this.validateForm();
    if (this.isValid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;

      // Mettre à jour les données du rendez-vous
      this.nouvelleDemandService.updateRendezVousData(
        this.date_rdv,
        this.heure_rdv
      );

      const formData = this.nouvelleDemandService.getFormData();

      // Vérifier si nous avons des fichiers à uploader
      if (formData._tempFiles?.files) {
        this.demandeService
          .submitDemande(formData, formData._tempFiles.files)
          .subscribe({
            next: (response) => {
              console.log('Demande créée avec succès:', response);
              this.nouvelleDemandService.resetForm();
              this.router.navigate(['/BO/mes-demandes']);
            },
            error: (error) => {
              console.error('Erreur lors de la création de la demande:', error);
              this.error =
                'Une erreur est survenue lors de la création de la demande. Veuillez réessayer.';
              this.isSubmitting = false;
            },
          });
      } else {
        // Cas où il n'y a pas d'images
        this.demandeService.createDemande(formData, []).subscribe({
          next: (response) => {
            console.log('Demande créée avec succès:', response);
            this.nouvelleDemandService.resetForm();
            this.router.navigate(['/BO/mes-demandes']);
          },
          error: (error) => {
            console.error('Erreur lors de la création de la demande:', error);
            this.error =
              'Une erreur est survenue lors de la création de la demande. Veuillez réessayer.';
            this.isSubmitting = false;
          },
        });
      }
    }
  }

  onPreviousStep(): void {
    if (this.date_rdv || this.heure_rdv) {
      this.nouvelleDemandService.updateRendezVousData(
        this.date_rdv,
        this.heure_rdv
      );
    }
    this.previousStep.emit();
  }
}
