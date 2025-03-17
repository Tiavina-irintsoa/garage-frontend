import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-rendez-vous-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rendez-vous-form.component.html',
  styleUrls: ['./rendez-vous-form.component.css'],
})
export class RendezVousFormComponent {
  @Input() currentStep: number = 4;
  @Output() previousStep = new EventEmitter<void>();
  @Output() stepComplete = new EventEmitter<any>();

  rendezVousForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.rendezVousForm = this.fb.group({
      // Les champs seront ajoutés plus tard
    });
  }

  onSubmit() {
    if (this.rendezVousForm.valid) {
      this.stepComplete.emit(this.rendezVousForm.value);
    }
  }

  onPreviousStep(): void {
    this.previousStep.emit();
  }
}
