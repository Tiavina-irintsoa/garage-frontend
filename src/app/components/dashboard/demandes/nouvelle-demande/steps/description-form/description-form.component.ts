import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-description-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './description-form.component.html',
  styleUrls: ['./description-form.component.css'],
})
export class DescriptionFormComponent {
  @Output() stepComplete = new EventEmitter<any>();

  descriptionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.descriptionForm = this.fb.group({
      // Les champs seront ajoutés plus tard
    });
  }

  onSubmit() {
    if (this.descriptionForm.valid) {
      this.stepComplete.emit(this.descriptionForm.value);
    }
  }
}
