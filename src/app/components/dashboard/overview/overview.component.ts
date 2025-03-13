import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h1 class="text-2xl font-bold text-blue-primary mb-4">Tableau de bord</h1>
      <p class="text-gray-600">Bienvenue dans votre espace personnel</p>
    </div>
  `,
})
export class OverviewComponent {}
