import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  ViewChild,
  OnDestroy,
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
import { ImageDemande } from '../../../../../../models/demande.interface';

// Enregistrer les plugins FilePond
registerPlugin(FilePondPluginFileValidateType);

@Component({
  selector: 'app-description-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FilePondModule],
  templateUrl: './description-form.component.html',
  styleUrls: ['./description-form.component.scss'],
})
export class DescriptionFormComponent implements OnInit, OnDestroy {
  @ViewChild('myPond') myPond!: FilePondComponent;
  @Output() stepComplete = new EventEmitter<void>();
  @Input() currentStep: number = 3;
  @Output() previousStep = new EventEmitter<void>();

  description: string = '';
  error: string | null = null;
  isValid: boolean = false;
  selectedFiles: File[] = [];
  pondFiles: any[] = [];
  images: ImageDemande[] = [];

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
      if (data.images) {
        this.images = data.images;
        // Restaurer les fichiers temporaires si disponibles
        if ((data as any)._tempFiles) {
          this.selectedFiles = (data as any)._tempFiles.files;
          this.pondFiles = (data as any)._tempFiles.pondFiles;
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyer les URLs des objets si nécessaire
    this.images.forEach((image) => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
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
      this.selectedFiles.push(event.file.file);
      this.pondFiles = [...this.pondFiles, event.file];
      this.nouvelleDemandService.updateImagesData(
        this.selectedFiles,
        this.pondFiles
      );
    }
  }

  pondHandleRemoveFile(event: any): void {
    console.log('Image supprimée', event.file);
    const index = this.selectedFiles.findIndex(
      (file) => file === event.file.file
    );
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
      this.pondFiles = this.pondFiles.filter((f) => f !== event.file);
      this.nouvelleDemandService.updateImagesData(
        this.selectedFiles,
        this.pondFiles
      );
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
      this.nouvelleDemandService.updateImagesData(
        this.selectedFiles,
        this.pondFiles
      );
      this.stepComplete.emit();
    }
  }

  onPreviousStep(): void {
    if (this.description) {
      this.nouvelleDemandService.updateDescriptionData(this.description);
    }
    this.nouvelleDemandService.updateImagesData(
      this.selectedFiles,
      this.pondFiles
    );
    this.previousStep.emit();
  }
}
