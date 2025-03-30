import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AngularEditorModule,
  AngularEditorConfig,
} from '@kolkov/angular-editor';
import { NouvelleDemandService } from '../../../../../../services/nouvelle-demande.service';
import { UploadService } from '../../../../../../services/upload.service';
import { ImageDemande } from '../../../../../../models/demande.interface';
import { firstValueFrom } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

interface UploadResponse {
  url: string;
}

@Component({
  selector: 'app-description-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AngularEditorModule],
  template: `
    <div class="space-y-6">
      <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
        {{ error }}
      </div>

      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-900">
          Description détaillée
        </h3>
        <p class="text-sm text-gray-600">
          Décrivez en détail votre demande. Vous pouvez ajouter des images pour
          illustrer votre description.
        </p>

        <div class="editor-container">
          <div
            class="border border-gray-300 rounded-t-lg"
            [ngClass]="{ 'border-red-300': error }"
          >
            <angular-editor
              [(ngModel)]="description"
              [config]="editorConfig"
              (ngModelChange)="onDescriptionChange($event)"
            ></angular-editor>
          </div>
        </div>

        <div
          *ngIf="isUploading"
          class="flex items-center justify-center space-x-2 text-blue-600"
        >
          <div
            class="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-blue-600"
          ></div>
          <span>Upload en cours...</span>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between pt-4">
        <button
          *ngIf="currentStep > 1"
          (click)="onPreviousStep()"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Précédent
        </button>
        <button
          (click)="onSubmit()"
          [disabled]="!isValid || isUploading"
          class="px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .angular-editor-textarea {
        min-height: 300px !important;
        border: none !important;
        padding: 1rem !important;
        font-family: Arial, Helvetica, sans-serif !important;
      }
      :host ::ng-deep .angular-editor-toolbar {
        border: none !important;
        background-color: white !important;
      }
      :host ::ng-deep .angular-editor-button {
        background-color: white !important;
        padding: 0.5rem !important;
        margin: 0 0.25rem !important;
        border-radius: 0.375rem !important;
      }
      :host ::ng-deep .angular-editor-button i {
        font-style: normal !important;
        display: inline-block !important;
        font-family: 'Font Awesome 6 Free' !important;
        font-weight: 900 !important;
      }
      :host ::ng-deep .angular-editor-button:hover {
        background-color: #f3f4f6 !important;
        transition: all 0.2s ease-in-out;
      }
      :host ::ng-deep .angular-editor-toolbar-set {
        border-radius: 0.375rem;
        padding: 0.25rem;
        margin: 0 !important;
        background-color: white !important;
        border: none !important;
      }
      :host ::ng-deep .angular-editor-button.active {
        background-color: #e5e7eb !important;
      }
      :host ::ng-deep select {
        height: 2rem !important;
        padding: 0 0.5rem !important;
        font-size: 0.875rem !important;
        border-radius: 0.375rem !important;
        border-color: #e5e7eb !important;
      }
      :host ::ng-deep .fa-bold::before {
        content: '\\f032' !important;
      }
      :host ::ng-deep .fa-italic::before {
        content: '\\f033' !important;
      }
      :host ::ng-deep .fa-underline::before {
        content: '\\f0cd' !important;
      }
      :host ::ng-deep .fa-strikethrough::before {
        content: '\\f0cc' !important;
      }
      :host ::ng-deep .fa-list-ul::before {
        content: '\\f0ca' !important;
      }
      :host ::ng-deep .fa-list-ol::before {
        content: '\\f0cb' !important;
      }
      :host ::ng-deep .fa-link::before {
        content: '\\f0c1' !important;
      }
      :host ::ng-deep .fa-text-height::before {
        content: '\\f034' !important;
      }
      :host ::ng-deep .fa-image::before {
        content: '\\f03e' !important;
      }
    `,
  ],
})
export class DescriptionFormComponent implements OnInit {
  @Output() stepComplete = new EventEmitter<void>();
  @Input() currentStep: number = 3;
  @Output() previousStep = new EventEmitter<void>();

  description: string = '';
  error: string | null = null;
  uploadedImages: ImageDemande[] = [];
  isValid: boolean = false;
  isUploading: boolean = false;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '300px',
    maxHeight: '500px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Entrez votre description ici...',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    defaultFontSize: '3',
    uploadUrl: 'api/upload',
    uploadWithCredentials: false,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      [
        'subscript',
        'superscript',
        'justifyFull',
        'indent',
        'outdent',
        'heading',
        'fontName',
      ],
      [
        'fontSize',
        'textColor',
        'backgroundColor',
        'customClasses',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
      ],
    ],
  };

  constructor(
    private nouvelleDemandService: NouvelleDemandService,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    // Charger les données existantes s'il y en a
    this.nouvelleDemandService.formData$.subscribe((data) => {
      if (data.description) {
        this.description = data.description;
        this.validateContent();
      }
    });
  }

  onDescriptionChange(content: string) {
    this.validateContent();

    // Extraire et sauvegarder les nouvelles images
    const imageUrls = this.uploadService.extractImagesFromHtml(content);
    this.uploadedImages = imageUrls
      .filter((url) => this.uploadService.isCloudinaryUrl(url))
      .map((url) => ({
        url,
        nom: url.split('/').pop() || '',
        type: 'image/jpeg', // À améliorer pour détecter le vrai type
        taille: 0, // À améliorer
        dateUpload: new Date().toISOString(),
      }));
  }

  validateContent() {
    // Vérifier que la description n'est pas vide et contient du contenu réel
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.description;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    this.isValid = textContent.trim().length > 0;
  }

  onSubmit(): void {
    if (!this.isValid) {
      this.error = 'Veuillez entrer une description';
      return;
    }

    if (this.isUploading) {
      this.error = "Veuillez attendre la fin de l'upload des images";
      return;
    }

    this.nouvelleDemandService.updateDescriptionData(this.description);
    this.stepComplete.emit();
  }

  onPreviousStep(): void {
    if (this.description) {
      this.nouvelleDemandService.updateDescriptionData(this.description);
    }
    this.previousStep.emit();
  }
}
