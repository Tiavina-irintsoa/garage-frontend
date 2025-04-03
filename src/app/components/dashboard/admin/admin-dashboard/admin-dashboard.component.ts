import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '../../../../services/dashboard.service';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  isLoading = true;

  // Configuration du graphique CA
  revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ],
    datasets: [
      {
        data: [],
        label: "Chiffre d'affaires (Ar)",
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  revenueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Chiffre d'affaires mensuel",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            return value.toLocaleString('fr-FR') + ' Ar';
          },
        },
      },
    },
  };

  // Configuration du graphique Inscriptions
  registrationsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ],
    datasets: [
      {
        data: [],
        label: "Nombre d'inscriptions",
        backgroundColor: 'rgb(147, 51, 234)',
        borderColor: 'rgb(147, 51, 234)',
      },
    ],
  };

  registrationsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Inscriptions mensuelles',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Données pour le graphique des performances
  servicePerformanceData: {
    title: string;
    services: Array<{ name: string; value: number }>;
  } = {
    title: 'Performance des services',
    services: [],
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    // Générer la liste des années (5 ans en arrière jusqu'à l'année actuelle)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear; year++) {
      this.years.push(year);
    }

    this.loadDashboardData();
  }

  onYearChange() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading = true;

    forkJoin({
      revenue: this.dashboardService.getChiffreAffaire(this.selectedYear),
      registrations: this.dashboardService.getInscriptions(this.selectedYear),
      services: this.dashboardService.getServicesPerformance(this.selectedYear),
    }).subscribe({
      next: (data) => {
        // Mise à jour du graphique Chiffre d'affaires
        this.revenueChartData.datasets[0].data = data.revenue.chiffreAffaire;

        // Mise à jour du graphique Inscriptions
        this.registrationsChartData.datasets[0].data =
          data.registrations.inscriptions;

        // Mise à jour des performances des services
        this.servicePerformanceData.services = data.services.services.map(
          (service) => ({
            name: service.titre,
            value: parseFloat(service.pourcentage),
          })
        );

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.isLoading = false;
      },
    });
  }
}
