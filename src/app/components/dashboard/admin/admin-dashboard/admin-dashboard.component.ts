import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

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
        data: [
          150000, 180000, 210000, 190000, 250000, 280000, 300000, 290000,
          320000, 350000, 380000, 400000,
        ],
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
        data: [25, 30, 35, 28, 42, 38, 45, 40, 48, 50, 55, 60],
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
          stepSize: 10,
        },
      },
    },
  };

  // Données pour le graphique des performances (inchangé)
  servicePerformanceData = {
    title: 'Performance des services',
    services: [
      { name: 'Réparation moteur', value: 35 },
      { name: 'Changement huile', value: 25 },
      { name: 'Diagnostic', value: 20 },
      { name: 'Entretien général', value: 15 },
      { name: 'Autres', value: 5 },
    ],
  };

  ngOnInit() {
    // Générer la liste des années (5 ans en arrière jusqu'à l'année actuelle)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  onYearChange() {
    // Cette méthode sera utilisée plus tard pour charger les données de l'année sélectionnée
    console.log('Année sélectionnée:', this.selectedYear);
  }
}
