import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RepairService, Repair, RepairStatus } from '../../services/repair.service';
import { HttpClientModule } from '@angular/common/http';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  isLoading = true;
  isLoadingDetails = false;

  constructor(
    private repairService: RepairService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadRepairs();
  }

  private loadRepairs() {
    this.isLoading = true;
    const statuses: RepairStatus[] = ['ATTENTE_ASSIGNATION', 'ATTENTE_FACTURATION', 'PAYE', 'EN_COURS', 'TERMINEE'];
    
    statuses.forEach(status => {
      this.repairService.getRepairsByStatus(status).subscribe({
        next: (repairs) => {
          const column = this.columns.find(col => col.id === status);
          if (column) {
            column.cards = repairs.map(repair => this.mapRepairToCard(repair));
            column.count = column.cards.length;
          }
          // Vérifier si toutes les colonnes sont chargées
          if (this.columns.every(col => col.cards.length >= 0)) {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error(`Error loading repairs for status ${status}:`, error);
          this.isLoading = false;
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

  formatPrice(price: number | undefined): string {
    if (!price) return '0';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA'
    }).format(price);
  }

  formatMileage(mileage: number | undefined): string {
    if (!mileage) return '0';
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
  }

  selectedProject: KanbanCard | null = null;

  openProjectModal(card: RepairCard) {
    // Afficher immédiatement le modal avec un projet vide pour le skeleton loader
    this.selectedProject = {
      id: card.id,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      carInfo: card.carInfo,
      carYear: undefined,
      licensePlate: '',
      mileage: undefined,
      description: '',
      createdAt: card.createdAt,
      deadline: undefined,
      status: card.status,
      assignedTeam: [],
      services: [],
      images: [],
      invoiceUrl: undefined
    };
    this.isLoadingDetails = true;

    // Charger les détails
    this.repairService.getRepairDetail(card.id).subscribe({
      next: (response) => {
        const repair = response.data.demande;
        
        // Convertir les services en format attendu par la modal
        const services: Service[] = repair.services.map(service => ({
          id: service.id,
          type: this.mapServiceType(service.titre),
          estimatedDuration: service.temps_base,
          estimatedPrice: service.cout_base,
          tasks: [], // À implémenter quand les tâches seront disponibles
          requiredParts: [] // À implémenter quand les pièces seront disponibles
        }));

        this.selectedProject = {
          id: repair.id,
          clientName: `${repair.user.prenom} ${repair.user.nom}`,
          clientPhone: '06 12 34 56 78', // À implémenter quand disponible
          clientEmail: repair.user.email,
          carInfo: `${repair.vehicule.marque.libelle} ${repair.vehicule.modele.libelle} - ${repair.vehicule.immatriculation}`,
          carYear: 2020, // À implémenter quand disponible
          licensePlate: repair.vehicule.immatriculation,
          mileage: 50000, // À implémenter quand disponible
          description: repair.description,
          createdAt: new Date(repair.dateCreation),
          deadline: new Date(repair.deadline),
          status: repair.statut,
          assignedTeam: [], // À implémenter quand l'équipe sera disponible
          services: services,
          images: repair.images,
          invoiceUrl: repair.reference_paiement ? `https://example.com/factures/${repair.reference_paiement}.pdf` : undefined
        };
        this.isLoadingDetails = false;
      },
      error: (error) => {
        console.error('Error loading repair details:', error);
        this.isLoadingDetails = false;
      }
    });
  }

  private mapServiceType(titre: string): 'entretien' | 'réparation' | 'vidange' {
    const type = titre.toLowerCase();
    if (type.includes('vidange')) return 'vidange';
    if (type.includes('entretien')) return 'entretien';
    return 'réparation';
  }

  closeProjectModal() {
    this.selectedProject = null;
  }

  formatMarkdown(markdown: string | undefined): SafeHtml {
    if (!markdown) return '';
    const html = marked.parse(markdown) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
} 