import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

interface RepairCard {
  id: string;
  clientName: string;
  carInfo: string;
  createdAt: Date;
  assignedTo?: string;
  estimatedPrice?: number;
  status: string;
  serviceType: 'entretien' | 'réparation' | 'vidange';
}

interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  color: string;
  cards: RepairCard[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent {
  columns: KanbanColumn[] = [
    {
      id: 'waiting-assignment',
      title: 'En attente d\'assignation',
      count: 3,
      color: 'bg-yellow-100',
      cards: [
        { 
          id: '1', 
          clientName: 'Jean Dupont',
          carInfo: 'Peugeot 208 - AB-123-CD',
          createdAt: new Date('2024-02-20'),
          status: 'pending',
          serviceType: 'vidange'
        },
        { 
          id: '2', 
          clientName: 'Marie Martin',
          carInfo: 'Renault Clio - EF-456-GH',
          createdAt: new Date('2024-02-21'),
          status: 'pending',
          serviceType: 'entretien'
        },
        { 
          id: '3', 
          clientName: 'Pierre Durant',
          carInfo: 'Citroën C3 - IJ-789-KL',
          createdAt: new Date('2024-02-22'),
          status: 'pending',
          serviceType: 'réparation'
        }
      ]
    },
    {
      id: 'waiting-invoice',
      title: 'En attente de facturation',
      count: 2,
      color: 'bg-purple-100',
      cards: [
        { 
          id: '6', 
          clientName: 'Emma Leroy',
          carInfo: 'Mercedes Classe A - UV-678-WX',
          createdAt: new Date('2024-02-17'),
          assignedTo: 'Philippe',
          estimatedPrice: 450,
          status: 'to-invoice',
          serviceType: 'entretien'
        },
        { 
          id: '7', 
          clientName: 'Antoine Moreau',
          carInfo: 'Volkswagen Golf - YZ-901-AB',
          createdAt: new Date('2024-02-16'),
          assignedTo: 'Laurent',
          estimatedPrice: 780,
          status: 'to-invoice',
          serviceType: 'réparation'
        }
      ]
    },
    {
      id: 'paid',
      title: 'Payés',
      count: 1,
      color: 'bg-green-100',
      cards: [
        { 
          id: '8', 
          clientName: 'Julie Dubois',
          carInfo: 'Ford Fiesta - CD-234-EF',
          createdAt: new Date('2024-02-15'),
          assignedTo: 'Michel',
          estimatedPrice: 350,
          status: 'paid',
          serviceType: 'vidange'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'En cours',
      count: 2,
      color: 'bg-blue-100',
      cards: [
        { 
          id: '4', 
          clientName: 'Sophie Bernard',
          carInfo: 'BMW Serie 1 - MN-012-OP',
          createdAt: new Date('2024-02-19'),
          assignedTo: 'Michel',
          status: 'in-progress',
          serviceType: 'réparation'
        },
        { 
          id: '5', 
          clientName: 'Lucas Petit',
          carInfo: 'Audi A3 - QR-345-ST',
          createdAt: new Date('2024-02-18'),
          assignedTo: 'Thomas',
          status: 'in-progress',
          serviceType: 'entretien'
        }
      ]
    },
    {
      id: 'completed',
      title: 'Terminés',
      count: 2,
      color: 'bg-gray-100',
      cards: [
        { 
          id: '9', 
          clientName: 'François Roux',
          carInfo: 'Opel Corsa - GH-567-IJ',
          createdAt: new Date('2024-02-14'),
          assignedTo: 'Thomas',
          estimatedPrice: 620,
          status: 'completed',
          serviceType: 'réparation'
        },
        { 
          id: '10', 
          clientName: 'Catherine Simon',
          carInfo: 'Toyota Yaris - KL-890-MN',
          createdAt: new Date('2024-02-13'),
          assignedTo: 'Laurent',
          estimatedPrice: 290,
          status: 'completed',
          serviceType: 'vidange'
        }
      ]
    }
  ];

  // Définir l'ordre des états et les transitions autorisées
  stateTransitions: { [key: string]: string[] } = {
    'waiting-assignment': ['waiting-invoice'],  // Devis initial
    'waiting-invoice': ['paid', 'waiting-assignment'],  // Peut retourner en attente ou aller au paiement
    'paid': ['in-progress'],  // Une fois payé, on peut commencer les réparations
    'in-progress': ['completed'],  // Une fois en cours, on peut terminer
    'completed': ['in-progress']  // Possibilité de reprendre les réparations si nécessaire
  };

  // Vérifier si le déplacement est valide
  isValidMove(fromColumnId: string, toColumnId: string): boolean {
    // Récupérer les transitions autorisées pour la colonne source
    const allowedTransitions = this.stateTransitions[fromColumnId] || [];
    
    // Vérifier si la transition est autorisée
    return allowedTransitions.includes(toColumnId);
  }

  // Gérer le drop
  onDrop(event: CdkDragDrop<RepairCard[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const fromColumnId = event.previousContainer.id;
      const toColumnId = event.container.id;

      if (this.isValidMove(fromColumnId, toColumnId)) {
        // Récupérer la carte qui est déplacée
        const card = event.previousContainer.data[event.previousIndex];
        
        // Mettre à jour le statut en fonction de la colonne de destination
        switch (toColumnId) {
          case 'waiting-assignment':
            card.status = 'pending';
            break;
          case 'in-progress':
            card.status = 'in-progress';
            break;
          case 'waiting-invoice':
            card.status = 'to-invoice';
            break;
          case 'paid':
            card.status = 'paid';
            break;
          case 'completed':
            card.status = 'completed';
            break;
        }

        // Déplacer la carte
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        
        // Mettre à jour les compteurs
        this.updateColumnCounts();
      }
    }
  }

  // Vérifier si le drop est autorisé
  canDrop(fromColumnId: string, toColumnId: string): boolean {
    return this.isValidMove(fromColumnId, toColumnId);
  }

  // Mettre à jour les compteurs de colonnes
  private updateColumnCounts() {
    this.columns.forEach(column => {
      column.count = column.cards.length;
    });
  }

  getServiceTypeBadgeClass(serviceType: string): string {
    const baseClasses = 'text-xs px-2 py-1 rounded-full font-medium';
    switch (serviceType) {
      case 'entretien':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'réparation':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'vidange':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  addCard(columnId: string) {
    // Implement add card logic
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
} 