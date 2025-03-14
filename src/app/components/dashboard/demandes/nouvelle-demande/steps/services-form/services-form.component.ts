import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.css'],
})
export class ServicesFormComponent {
  @Output() stepComplete = new EventEmitter<any>();

  servicesForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.servicesForm = this.fb.group({
      // Les champs seront ajoutés plus tard
    });
  }

  onSubmit() {
    if (this.servicesForm.valid) {
      this.stepComplete.emit(this.servicesForm.value);
    }
  }
}
