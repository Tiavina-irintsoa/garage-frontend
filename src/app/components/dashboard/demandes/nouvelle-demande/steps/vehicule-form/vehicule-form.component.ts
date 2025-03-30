import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { VehiculeService } from '../../../../../../services/vehicule.service';
import {
  Marque,
  Modele,
  TypeVehicule,
  EtatVehicule,
  Vehicule,
} from '../../../../../../models/demande.interface';
import { NouvelleDemandService } from '../../../../../../services/nouvelle-demande.service';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicule-form.component.html',
  styleUrls: ['./vehicule-form.component.css'],
})
export class VehiculeFormComponent implements OnInit {
  @Output() stepComplete = new EventEmitter<any>();
  @Input() initialData?: Vehicule;
  @Input() currentStep: number = 1;
  @Output() previousStep = new EventEmitter<void>();

  vehiculeForm!: FormGroup;
  marques: Marque[] = [];
  modeles: Modele[] = [];
  typesVehicules: TypeVehicule[] = [];
  isLoading = true;
  error: string | null = null;

  etatsVehicule: { value: EtatVehicule; label: string }[] = [
    { value: 'NEUF', label: 'Neuf' },
    { value: 'USE', label: 'Usé' },
    { value: 'TRES_USE', label: 'Très usé' },
  ];

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private nouvelleDemandService: NouvelleDemandService
  ) {
    this.vehiculeForm = this.fb.group({
      marque: [''],
      marqueLibelle: ['', Validators.required],
      modele: [''],
      modeleLibelle: [''],
      couleur: ['#000000', Validators.required],
      type: ['', Validators.required],
      immatriculation: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/),
        ],
      ],
      etatVehicule: ['NEUF', Validators.required],
    });

    // Écouter les changements de marque pour charger les modèles
    this.vehiculeForm.get('marqueLibelle')?.valueChanges.subscribe((value) => {
      if (!value) {
        this.vehiculeForm.patchValue({
          marque: '',
          modele: '',
          modeleLibelle: '',
        });
        this.modeles = [];
      }
    });

    this.vehiculeForm.get('modeleLibelle')?.valueChanges.subscribe((value) => {
      if (!value) {
        this.vehiculeForm.patchValue({ modele: '' });
      }
    });
  }

  ngOnInit(): void {
    // Charger les données initiales
    this.loadInitialData();

    // S'abonner aux données du formulaire
    this.nouvelleDemandService.formData$.subscribe((data) => {
      if (data.vehicule) {
        this.vehiculeForm.patchValue({
          marque: data.vehicule.marque.id,
          marqueLibelle: data.vehicule.marque.libelle,
          modele: data.vehicule.modele.id,
          modeleLibelle: data.vehicule.modele.libelle,
          couleur: data.vehicule.couleur,
          type: data.vehicule.type.id,
          immatriculation: data.vehicule.immatriculation,
          etatVehicule: data.vehicule.etatVehicule,
        });
        // Charger les modèles correspondants à la marque
        this.loadModeles(data.vehicule.marque.id);
      }
    });
  }

  private loadInitialData(): void {
    this.vehiculeService.getMarques().subscribe({
      next: (response) => {
        this.marques = response.data.marques;
        this.loadTypesVehicules();
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des marques';
        this.isLoading = false;
      },
    });
  }

  private loadTypesVehicules(): void {
    this.vehiculeService.getTypesVehicules().subscribe({
      next: (response) => {
        this.typesVehicules = response.data.types;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des types de véhicules';
        this.isLoading = false;
      },
    });
  }

  private loadModeles(marqueId: string): void {
    this.vehiculeService.getModelesByMarque(marqueId).subscribe({
      next: (response) => {
        this.modeles = response.data.modeles;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des modèles';
      },
    });
  }

  onSubmit() {
    if (this.vehiculeForm.valid) {
      const formValue = this.vehiculeForm.value;
      const selectedMarque = this.marques.find(
        (m) => m.libelle === formValue.marqueLibelle
      );
      const selectedType = this.typesVehicules.find(
        (t) => t.id === formValue.type
      );

      if (!selectedMarque || !selectedType) {
        this.error = 'Veuillez sélectionner une marque et un type valides';
        if (!selectedMarque) {
          this.vehiculeForm.get('marqueLibelle')?.setErrors({ invalid: true });
        }
        if (!selectedType) {
          this.vehiculeForm.get('type')?.setErrors({ invalid: true });
        }
        return;
      }

      if (!formValue.modeleLibelle.trim()) {
        this.error = 'Veuillez entrer un modèle';
        this.vehiculeForm.get('modeleLibelle')?.setErrors({ required: true });
        return;
      }

      const vehiculeData = {
        marque: {
          id: selectedMarque.id,
          libelle: selectedMarque.libelle,
        },
        modele: {
          id: formValue.modele || '',
          libelle: formValue.modeleLibelle,
        },
        couleur: formValue.couleur,
        type: selectedType,
        immatriculation: formValue.immatriculation,
        etatVehicule: formValue.etatVehicule,
      };
      this.error = null;
      this.stepComplete.emit(vehiculeData);
    }
  }

  onMarqueInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedMarque = this.marques.find((m) => m.libelle === input.value);
    if (selectedMarque) {
      this.vehiculeForm.patchValue({
        marque: selectedMarque.id,
        marqueLibelle: selectedMarque.libelle,
      });
      this.loadModeles(selectedMarque.id);
      this.vehiculeForm.get('marqueLibelle')?.setErrors(null);
    } else {
      this.vehiculeForm.patchValue({ marque: '' });
      if (input.value) {
        this.vehiculeForm.get('marqueLibelle')?.setErrors({ invalid: true });
      }
    }
  }

  onModeleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedModele = this.modeles.find((m) => m.libelle === input.value);

    // Si c'est un nouveau modèle (pas dans la liste), on accepte la valeur
    if (input.value && !selectedModele) {
      this.vehiculeForm.patchValue({
        modele: '',
        modeleLibelle: input.value,
      });
      this.vehiculeForm.get('modeleLibelle')?.setErrors(null);
    }
    // Si c'est un modèle existant
    else if (selectedModele) {
      this.vehiculeForm.patchValue({
        modele: selectedModele.id,
        modeleLibelle: selectedModele.libelle,
      });
      this.vehiculeForm.get('modeleLibelle')?.setErrors(null);
    }
    // Si le champ est vide
    else {
      this.vehiculeForm.patchValue({ modele: '' });
    }
  }

  onPreviousStep(): void {
    this.previousStep.emit();
  }
}
