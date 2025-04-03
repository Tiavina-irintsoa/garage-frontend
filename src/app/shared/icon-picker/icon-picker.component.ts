import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div
        #triggerButton
        class="flex items-center border rounded p-2 cursor-pointer"
        (click)="toggleDropdown($event)"
      >
        <i [class]="selectedIcon" class="mr-2"></i>
        <span class="text-sm">{{
          selectedIcon || 'Sélectionner une icône'
        }}</span>
      </div>

      <div
        *ngIf="isOpen"
        #dropdown
        class="absolute z-[9999] w-64 max-h-60 overflow-y-auto bg-white border rounded shadow-lg"
        [class.bottom-full]="showAbove"
        [class.top-full]="!showAbove"
        [class.mb-1]="showAbove"
        [class.mt-1]="!showAbove"
      >
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (input)="filterIcons()"
          placeholder="Rechercher une icône..."
          class="w-full p-2 border-b"
        />
        <div class="grid grid-cols-4 gap-2 p-2">
          <div
            *ngFor="let icon of filteredIcons"
            (click)="selectIcon(icon)"
            class="flex flex-col items-center p-2 hover:bg-gray-100 cursor-pointer rounded"
          >
            <i [class]="icon" class="text-xl mb-1"></i>
            <span class="text-xs text-center break-all">{{ icon }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class IconPickerComponent {
  @Input() selectedIcon: string = '';
  @Output() iconSelected = new EventEmitter<string>();
  @ViewChild('triggerButton') triggerButton!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;

  isOpen = false;
  showAbove = false;
  searchTerm = '';
  filteredIcons: string[] = [];

  // Liste prédéfinie d'icônes Font Awesome pour les services automobiles
  private icons = [
    'fas fa-wrench',
    'fas fa-tools',
    'fas fa-oil-can',
    'fas fa-car',
    'fas fa-car-battery',
    'fas fa-car-crash',
    'fas fa-car-side',
    'fas fa-cog',
    'fas fa-cogs',
    'fas fa-gas-pump',
    'fas fa-key',
    'fas fa-steering-wheel',
    'fas fa-tire',
    'fas fa-truck',
    'fas fa-truck-pickup',
    'fas fa-screwdriver',
    'fas fa-hammer',
    'fas fa-toolbox',
    'fas fa-spray-can',
    'fas fa-paint-roller',
    'fas fa-brush',
    'fas fa-temperature-high',
    'fas fa-fan',
    'fas fa-bolt',
    'fas fa-tachometer-alt',
    'fas fa-clock',
    'fas fa-calendar-check',
    'fas fa-clipboard-check',
    'fas fa-check-circle',
    'fas fa-diagnoses',
  ];

  constructor(private elementRef: ElementRef) {
    this.filteredIcons = [...this.icons];
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.filterIcons();
      setTimeout(() => this.updateDropdownPosition(), 0);
    }
  }

  private updateDropdownPosition(): void {
    if (!this.triggerButton || !this.dropdown) return;

    const triggerRect =
      this.triggerButton.nativeElement.getBoundingClientRect();
    const dropdownRect = this.dropdown.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Espace disponible en dessous du trigger
    const spaceBelow = viewportHeight - triggerRect.bottom;
    // Espace disponible au-dessus du trigger
    const spaceAbove = triggerRect.top;

    // Si l'espace en dessous est insuffisant et qu'il y a plus d'espace au-dessus
    this.showAbove =
      spaceBelow < dropdownRect.height && spaceAbove > spaceBelow;
  }

  filterIcons(): void {
    if (!this.searchTerm) {
      this.filteredIcons = [...this.icons];
      return;
    }

    this.filteredIcons = this.icons.filter((icon) =>
      icon.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.iconSelected.emit(icon);
    this.isOpen = false;
  }
}
