import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NouvelleDemandService } from '../../../../../../services/nouvelle-demande.service';
import {
  FilePondModule,
  FilePondComponent,
  registerPlugin,
} from 'ngx-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Enregistrer les plugins FilePond
registerPlugin(FilePondPluginFileValidateType);

@Component({
  selector: 'app-description-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FilePondModule],
  templateUrl: './description-form.component.html',
  styleUrls: ['./description-form.component.scss'],
})
export class DescriptionFormComponent implements OnInit {
  @ViewChild('myPond') myPond!: FilePondComponent;
  @Output() stepComplete = new EventEmitter<void>();
  @Input() currentStep: number = 3;
  @Output() previousStep = new EventEmitter<void>();

  description: string = '';
  error: string | null = null;
  isValid: boolean = false;
  selectedImages: File[] = [];
  pondFiles: any[] = [];

  pondOptions = {
    allowMultiple: true,
    maxFiles: 5,
    instantUpload: false,
    allowReorder: true,
    labelIdle:
      'Glissez et déposez vos images ici ou <span class="filepond--label-action">Parcourir</span>',
    acceptedFileTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    fileValidateTypeLabelExpectedTypes: 'Formats acceptés : JPG, PNG',
    labelFileTypeNotAllowed: 'Type de fichier non autorisé',
    labelTapToCancel: 'Cliquer pour annuler',
    labelTapToRetry: 'Cliquer pour réessayer',
    labelTapToUndo: 'Cliquer pour supprimer',
    labelFileProcessing: 'Chargement',
    labelFileProcessingComplete: 'Chargé',
    labelFileProcessingAborted: 'Annulé',
    labelFileProcessingError: 'Erreur lors du chargement',
    styleLoadIndicatorPosition: 'center bottom',
    styleProgressIndicatorPosition: 'right bottom',
    styleButtonRemoveItemPosition: 'left bottom',
    styleButtonProcessItemPosition: 'right bottom',
    name: 'images',
  };

  constructor(private nouvelleDemandService: NouvelleDemandService) {}

  ngOnInit(): void {
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

  pondHandleInit(): void {
    console.log('FilePond initialisé', this.myPond);
  }

  pondHandleAddFile(event: any): void {
    console.log('Image ajoutée', event.file);
    if (event.file && event.file.file) {
      this.selectedImages.push(event.file.file);
      this.pondFiles = [...this.selectedImages];
    }
  }

  pondHandleRemoveFile(event: any): void {
    console.log('Image supprimée', event.file);
    const index = this.selectedImages.findIndex(
      (file) => file === event.file.file
    );
    if (index > -1) {
      this.selectedImages.splice(index, 1);
      this.pondFiles = [...this.selectedImages];
    }
  }

  pondHandleError(error: any): void {
    console.error('Erreur FilePond:', error);
    this.error = "Une erreur est survenue lors du chargement de l'image";
  }

  onSubmit(): void {
    this.validateContent();
    if (this.isValid) {
      this.nouvelleDemandService.updateDescriptionData(this.description);
      // Ici vous pouvez stocker les images sélectionnées dans le service
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
