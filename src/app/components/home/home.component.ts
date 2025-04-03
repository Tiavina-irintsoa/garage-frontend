import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  services: Service[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private serviceService: ServiceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadServices();
    } else {
      this.isLoading = false;
    }
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (response) => {
        if (response.data?.services) {
          this.services = response.data.services;
        }
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des services:', error);
        this.isLoading = false;
      },
    });
  }
}
