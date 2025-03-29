import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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
          serviceType: 'vidange',
          assignedTeam: []
        },
        { 
          id: '2', 
          clientName: 'Marie Martin',
          carInfo: 'Renault Clio - EF-456-GH',
          createdAt: new Date('2024-02-21'),
          status: 'pending',
          serviceType: 'entretien',
          assignedTeam: []
        },
        { 
          id: '3', 
          clientName: 'Pierre Durant',
          carInfo: 'Citroën C3 - IJ-789-KL',
          createdAt: new Date('2024-02-22'),
          status: 'pending',
          serviceType: 'réparation',
          assignedTeam: []
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
          assignedTeam: [
            { id: '1', name: 'Philippe', role: 'Mécanicien' }
          ],
          estimatedPrice: 450,
          status: 'to-invoice',
          serviceType: 'entretien'
        },
        { 
          id: '7', 
          clientName: 'Antoine Moreau',
          carInfo: 'Volkswagen Golf - YZ-901-AB',
          createdAt: new Date('2024-02-16'),
          assignedTeam: [
            { id: '2', name: 'Laurent', role: 'Technicien' }
          ],
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
          assignedTeam: [
            { id: '3', name: 'Michel', role: 'Mécanicien' }
          ],
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
          assignedTeam: [
            { id: '3', name: 'Michel', role: 'Mécanicien principal' },
            { id: '5', name: 'Sarah', role: 'Assistante mécanicienne' },
            { id: '6', name: 'Jean', role: 'Expert diagnostic' }
          ],
          status: 'in-progress',
          serviceType: 'réparation',
          estimatedPrice: 850,
          services: [
            {
              id: '1',
              type: 'réparation',
              estimatedDuration: 4,
              estimatedPrice: 550,
              tasks: [],
              requiredParts: []
            },
            {
              id: '2',
              type: 'entretien',
              estimatedDuration: 2,
              estimatedPrice: 300,
              tasks: [],
              requiredParts: []
            }
          ]
        },
        { 
          id: '5', 
          clientName: 'Lucas Petit',
          carInfo: 'Audi A3 - QR-345-ST',
          createdAt: new Date('2024-02-18'),
          assignedTeam: [
            { id: '4', name: 'Thomas', role: 'Technicien' },
            { id: '7', name: 'Marie', role: 'Spécialiste électronique' }
          ],
          status: 'in-progress',
          serviceType: 'entretien',
          estimatedPrice: 420
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
          assignedTeam: [
            { id: '4', name: 'Thomas', role: 'Technicien' }
          ],
          estimatedPrice: 620,
          status: 'completed',
          serviceType: 'réparation'
        },
        { 
          id: '10', 
          clientName: 'Catherine Simon',
          carInfo: 'Toyota Yaris - KL-890-MN',
          createdAt: new Date('2024-02-13'),
          assignedTeam: [
            { id: '2', name: 'Laurent', role: 'Technicien' }
          ],
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
    // Projet spécial pour la carte avec ID '4' (Sophie Bernard)
    if (card.id === '4') {
      this.selectedProject = {
        id: card.id,
        clientName: card.clientName,
        clientPhone: '06 12 34 56 78',
        clientEmail: 'sophie.bernard@email.com',
        carInfo: card.carInfo,
        carYear: 2021,
        licensePlate: 'MN-012-OP',
        mileage: 45000,
        description: 'Réparation complexe nécessitant plusieurs interventions',
        createdAt: card.createdAt,
        deadline: new Date(card.createdAt.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: card.status,
        assignedTeam: card.assignedTeam || [],
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
              },
              {
                id: '3',
                description: 'Test et ajustement',
                completed: false,
                estimatedTime: 1,
                assignedTo: 'Sarah'
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
              },
              {
                id: '2',
                name: 'Disques de frein',
                reference: 'DF-BMW-456',
                price: 180,
                quantity: 2,
                status: 'En stock'
              }
            ]
          },
          {
            id: '2',
            type: 'entretien',
            estimatedDuration: 2,
            estimatedPrice: 300,
            tasks: [
              {
                id: '4',
                description: 'Vidange huile moteur',
                completed: false,
                estimatedTime: 1,
                assignedTo: 'Michel'
              },
              {
                id: '5',
                description: 'Remplacement filtre à air',
                completed: false,
                estimatedTime: 0.5,
                assignedTo: 'Sarah'
              },
              {
                id: '6',
                description: 'Vérification des niveaux',
                completed: false,
                estimatedTime: 0.5,
                assignedTo: 'Sarah'
              }
            ],
            requiredParts: [
              {
                id: '3',
                name: 'Huile moteur synthétique',
                reference: 'HM-BMW-789',
                price: 85,
                quantity: 5,
                status: 'En stock'
              },
              {
                id: '4',
                name: 'Filtre à air',
                reference: 'FA-BMW-012',
                price: 35,
                quantity: 1,
                status: 'En stock'
              }
            ]
          }
        ],
        images: [
          'https://example.com/bmw-front.jpg',
          'https://example.com/bmw-brake.jpg',
          'https://example.com/bmw-engine.jpg'
        ],
        invoiceUrl: 'https://example.com/facture-sophie-bernard.pdf'
      };
      return;
    }
    
    // Pour les autres cartes, garder le comportement par défaut
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
      assignedTeam: card.assignedTeam || [],
      services: [
        {
          id: '1',
          type: 'entretien',
          estimatedDuration: 2,
          estimatedPrice: 150,
          tasks: [
            {
              id: '1',
              description: 'Vérification des niveaux',
              completed: false,
              estimatedTime: 0.5,
              assignedTo: 'Philippe'
            },
            {
              id: '2',
              description: 'Changement filtre à huile',
              completed: false,
              estimatedTime: 0.5,
              assignedTo: 'Laurent'
            }
          ],
          requiredParts: [
            {
              id: '1',
              name: 'Filtre à huile',
              reference: 'FH-123',
              price: 25,
              quantity: 1,
              status: 'En stock'
            },
            {
              id: '2',
              name: 'Huile moteur',
              reference: 'HM-456',
              price: 45,
              quantity: 5,
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