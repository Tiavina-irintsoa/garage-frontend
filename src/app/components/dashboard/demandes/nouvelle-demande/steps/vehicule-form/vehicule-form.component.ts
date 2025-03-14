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
      marque: ['', Validators.required],
      marqueLibelle: ['', Validators.required],
      modele: ['', Validators.required],
      modeleLibelle: ['', Validators.required],
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
    this.vehiculeForm.get('marque')?.valueChanges.subscribe((marqueId) => {
      if (marqueId) {
        this.loadModeles(marqueId);
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
      const selectedModele = this.modeles.find(
        (m) => m.libelle === formValue.modeleLibelle
      );
      const selectedType = this.typesVehicules.find(
        (t) => t.id === formValue.type
      );

      if (!selectedMarque || !selectedType) {
        this.error = 'Veuillez sélectionner une marque et un type valides';
        return;
      }

      const vehiculeData = {
        marque: {
          id: selectedMarque.id,
          libelle: selectedMarque.libelle,
        },
        modele: {
          id: selectedModele?.id || '',
          libelle: formValue.modeleLibelle,
        },
        couleur: formValue.couleur,
        type: selectedType,
        immatriculation: formValue.immatriculation,
        etatVehicule: formValue.etatVehicule,
      };
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
    }
  }

  onModeleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedModele = this.modeles.find((m) => m.libelle === input.value);
    if (selectedModele) {
      this.vehiculeForm.patchValue({
        modele: selectedModele.id,
        modeleLibelle: selectedModele.libelle,
      });
    }
  }
}
