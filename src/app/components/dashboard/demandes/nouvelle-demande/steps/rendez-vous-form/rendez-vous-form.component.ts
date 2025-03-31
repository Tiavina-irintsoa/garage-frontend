import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NouvelleDemandService } from '../../../../../../services/nouvelle-demande.service';

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

  // Date minimum (aujourd'hui)
  minDate: string = new Date().toISOString().split('T')[0];

  // Date maximum (3 mois à partir d'aujourd'hui)
  maxDate: string = new Date(new Date().setMonth(new Date().getMonth() + 3))
    .toISOString()
    .split('T')[0];

  constructor(private nouvelleDemandService: NouvelleDemandService) {}

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
    console.log('new formData : ', this.nouvelleDemandService.getFormData());
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
    console.log('Final Data ', this.nouvelleDemandService.getFormData());
    if (this.isValid) {
      this.nouvelleDemandService.updateRendezVousData(
        this.date_rdv,
        this.heure_rdv
      );
      this.stepComplete.emit();
    }
  }

  onPreviousStep(): void {
    console.log(' data ', this.nouvelleDemandService.getFormData());

    if (this.date_rdv || this.heure_rdv) {
      this.nouvelleDemandService.updateRendezVousData(
        this.date_rdv,
        this.heure_rdv
      );
    }
    this.previousStep.emit();
  }
}
