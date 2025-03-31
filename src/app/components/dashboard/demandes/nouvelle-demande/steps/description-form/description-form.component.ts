import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NouvelleDemandService } from '../../../../../../services/nouvelle-demande.service';

@Component({
  selector: 'app-description-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './description-form.component.html',
  styleUrls: ['./description-form.component.scss'],
})
export class DescriptionFormComponent implements OnInit {
  @Output() stepComplete = new EventEmitter<void>();
  @Input() currentStep: number = 3;
  @Output() previousStep = new EventEmitter<void>();

  description: string = '';
  error: string | null = null;
  isValid: boolean = false;

  constructor(private nouvelleDemandService: NouvelleDemandService) {}

  ngOnInit(): void {
    // Charger les données existantes s'il y en a
    this.nouvelleDemandService.formData$.subscribe((data) => {
      if (data.description) {
        this.description = data.description;
        this.validateContent();
      }
    });
  }

  onDescriptionChange(value: string): void {
    this.description = value;
    this.validateContent();
  }

  validateContent(): void {
    this.isValid = this.description.trim().length > 0;
    this.error = this.isValid ? null : 'La description est requise';
  }

  onSubmit(): void {
    this.validateContent();
    if (this.isValid) {
      this.nouvelleDemandService.updateDescriptionData(this.description);
      this.stepComplete.emit();
    }
  }

  onPreviousStep(): void {
    if (this.description) {
      this.nouvelleDemandService.updateDescriptionData(this.description);
    }
    this.previousStep.emit();
  }
}
