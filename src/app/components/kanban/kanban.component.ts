import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RepairService, Repair, RepairStatus } from '../../services/repair.service';
import { HttpClientModule } from '@angular/common/http';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
  estimatedTime: number;
  assignedTo: string;
}

interface Part {
  id: string;
  name: string;
  reference: string;
  price: number;
  quantity: number;
  status: 'En stock' | 'En commande' | 'Non disponible';
}

interface Service {
  id: string;
  type: 'entretien' | 'réparation' | 'vidange';
  estimatedDuration: number;
  estimatedPrice: number;
  tasks: Task[];
  requiredParts: Part[];
}

interface RepairCard {
  id: string;
  clientName: string;
  carInfo: string;
  createdAt: Date;
  assignedTeam?: TeamMember[];
  estimatedPrice?: number;
  status: string;
  serviceType: 'entretien' | 'réparation' | 'vidange';
  services?: Service[];
}

interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  color: string;
  cards: RepairCard[];
}

interface KanbanCard {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  carInfo: string;
  carYear?: number;
  licensePlate?: string;
  mileage?: number;
  description?: string;
  createdAt: Date;
  deadline?: Date;
  status: string;
  assignedTeam: TeamMember[];
  services: Service[];
  images?: string[];
  invoiceUrl?: string;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, HttpClientModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  columns: KanbanColumn[] = [
    {
      id: 'ATTENTE_ASSIGNATION',
      title: 'En attente d\'assignation',
      count: 0,
      color: 'bg-yellow-100',
      cards: []
    },
    {
      id: 'ATTENTE_FACTURATION',
      title: 'En attente de facturation',
      count: 0,
      color: 'bg-purple-100',
      cards: []
    },
    {
      id: 'PAYE',
      title: 'Payés',
      count: 0,
      color: 'bg-green-100',
      cards: []
    },
    {
      id: 'EN_COURS',
      title: 'En cours',
      count: 0,
      color: 'bg-blue-100',
      cards: []
    },
    {
      id: 'TERMINEE',
      title: 'Terminés',
      count: 0,
      color: 'bg-gray-100',
      cards: []
    }
  ];

  constructor(private repairService: RepairService) {}

  ngOnInit() {
    this.loadRepairs();
  }

  private loadRepairs() {
    const statuses: RepairStatus[] = ['ATTENTE_ASSIGNATION', 'ATTENTE_FACTURATION', 'PAYE', 'EN_COURS', 'TERMINEE'];
    
    statuses.forEach(status => {
      this.repairService.getRepairsByStatus(status).subscribe({
        next: (repairs) => {
          const column = this.columns.find(col => col.id === status);
          if (column) {
            column.cards = repairs.map(repair => this.mapRepairToCard(repair));
            column.count = column.cards.length;
          }
        },
        error: (error) => {
          console.error(`Error loading repairs for status ${status}:`, error);
        }
      });
    });
  }

  private mapRepairToCard(repair: Repair): RepairCard {
    return {
      id: repair.id,
      clientName: `${repair.user.prenom} ${repair.user.nom}`,
      carInfo: `${repair.vehicule.marque.libelle} ${repair.vehicule.modele.libelle} - ${repair.vehicule.immatriculation}`,
      createdAt: new Date(repair.date_rdv),
      status: repair.reference_paiement ? 'PAYE' : 'ATTENTE_ASSIGNATION',
      serviceType: 'réparation', // À adapter selon les detailServiceIds
      estimatedPrice: repair.estimation.cout_estime,
      services: [] // À remplir avec les détails des services
    };
  }

  // Définir l'ordre des états et les transitions autorisées
  stateTransitions: { [key: string]: RepairStatus[] } = {
    'ATTENTE_ASSIGNATION': ['ATTENTE_FACTURATION'],
    'ATTENTE_FACTURATION': ['PAYE', 'ATTENTE_ASSIGNATION'],
    'PAYE': ['EN_COURS'],
    'EN_COURS': ['TERMINEE'],
    'TERMINEE': ['EN_COURS']
  };

  // Vérifier si le déplacement est valide
  isValidMove(fromColumnId: string, toColumnId: string): boolean {
    // Récupérer les transitions autorisées pour la colonne source
    const allowedTransitions = this.stateTransitions[fromColumnId] || [];
    
    // Vérifier si la transition est autorisée
    return allowedTransitions.includes(toColumnId as RepairStatus);
  }

  // Gérer le drop
  onDrop(event: CdkDragDrop<RepairCard[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const fromColumnId = event.previousContainer.id;
      const toColumnId = event.container.id;

      if (this.isValidMove(fromColumnId, toColumnId)) {
        const card = event.previousContainer.data[event.previousIndex];
        
        // Mettre à jour le statut via l'API
        this.repairService.updateRepairStatus(card.id, toColumnId as RepairStatus).subscribe({
          next: (updatedRepair) => {
            // Mettre à jour le statut localement
            card.status = toColumnId;
            
            // Déplacer la carte
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex
            );
            
            // Mettre à jour les compteurs
            this.updateColumnCounts();
          },
          error: (error) => {
            console.error('Error updating repair status:', error);
            // Gérer l'erreur (afficher un message, etc.)
          }
        });
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

  getServiceTypeBadgeClass(serviceType: 'entretien' | 'réparation' | 'vidange'): string {
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

  formatDate(date: Date | undefined): string {
    if (!date) return 'Non définie';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  selectedProject: KanbanCard | null = null;

  openProjectModal(card: RepairCard) {
    // Pour l'instant, on utilise des données statiques
    this.selectedProject = {
      id: card.id,
      clientName: card.clientName,
      clientPhone: '06 12 34 56 78',
      clientEmail: 'client@example.com',
      carInfo: card.carInfo,
      carYear: 2020,
      licensePlate: 'AB-123-CD',
      mileage: 50000,
      description: 'Description détaillée de la réparation à effectuer',
      createdAt: card.createdAt,
      deadline: new Date(card.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: card.status,
      assignedTeam: [
        { id: '1', name: 'Michel', role: 'Mécanicien principal' },
        { id: '2', name: 'Sarah', role: 'Assistante mécanicienne' }
      ],
      services: [
        {
          id: '1',
          type: 'réparation',
          estimatedDuration: 4,
          estimatedPrice: 550,
          tasks: [
            {
              id: '1',
              description: 'Diagnostic système de freinage',
              completed: true,
              estimatedTime: 1,
              assignedTo: 'Jean'
            },
            {
              id: '2',
              description: 'Remplacement des plaquettes de frein',
              completed: false,
              estimatedTime: 2,
              assignedTo: 'Michel'
            }
          ],
          requiredParts: [
            {
              id: '1',
              name: 'Plaquettes de frein avant',
              reference: 'PF-BMW-123',
              price: 120,
              quantity: 1,
              status: 'En stock'
            }
          ]
        }
      ],
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ],
      invoiceUrl: 'https://example.com/facture.pdf'
    };
  }

  closeProjectModal() {
    this.selectedProject = null;
  }
} 