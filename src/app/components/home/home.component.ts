import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private serviceService: ServiceService) {}

  ngOnInit() {
    this.loadServices();
  }

  private loadServices() {
    this.serviceService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des services';
        this.isLoading = false;
      },
    });
  }
}
