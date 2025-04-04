import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RepairService, Repair, RepairStatus } from '../../services/repair.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  assignedMember?: TeamMember;
  estimatedTime?: number;
}

interface Part {
  id: string;
  reference: string;
  nom: string;
  description: string;
  prix: number;
  quantity: number;
}

interface Service {
  id: string;
  type: 'entretien' | 'réparation' | 'vidange';
  estimatedDuration: number;
  estimatedPrice: number;
  tasks: Task[];
  parts: Part[];
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, HttpClientModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  @ViewChild('assigneeSelect') assigneeSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('newTaskInput') newTaskInput!: ElementRef<HTMLInputElement>;

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

  private assigneeMenuState: { [key: string]: boolean } = {};
  private partsMenuState: { [key: string]: boolean } = {};
  private partsSearchText: { [key: string]: string } = {};
  private selectedPartId: string | null = null;

  availableParts: Part[] = [];

  constructor(
    private repairService: RepairService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadRepairs();
    this.loadAvailableParts();
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
          parts: [] // À implémenter quand les pièces seront disponibles
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
          assignedTeam: [
            {
              id: '1',
              name: 'Tsiory',
              role: 'Mécanicien',
              avatar: 'https://ui-avatars.com/api/?name=Tsiory&background=random'
            },
            {
              id: '2',
              name: 'Rova',
              role: 'Mécanicien',
              avatar: 'https://ui-avatars.com/api/?name=Rova&background=random'
            }
          ],
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

  toggleAssigneeMenu(taskId: string) {
    this.assigneeMenuState[taskId] = !this.assigneeMenuState[taskId];
  }

  isAssigneeMenuOpen(taskId: string): boolean {
    return this.assigneeMenuState[taskId] || false;
  }

  assignTaskToMember(service: Service, taskId: string, memberId: string) {
    const task = service.tasks.find(t => t.id === taskId);
    if (task) {
      task.assignedTo = memberId;
      task.assignedMember = this.selectedProject?.assignedTeam.find(m => m.id === memberId);
      // Ici, vous pouvez ajouter la logique pour sauvegarder l'assignation
    }
    this.toggleAssigneeMenu(taskId);
  }

  setNewTaskAssignee(memberId: string) {
    // Stocker l'assignation pour la prochaine tâche créée
    this.newTaskAssignee = memberId;
    const member = this.selectedProject?.assignedTeam.find(m => m.id === memberId);
    this.newTaskAssigneeMember = member || null;
    this.toggleAssigneeMenu('new');
  }

  private newTaskAssignee: string | null = null;
  newTaskAssigneeMember: TeamMember | null = null;

  addTask(service: Service, title: string) {
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      assignedTo: this.newTaskAssignee || undefined,
      assignedMember: this.newTaskAssigneeMember || undefined
    };

    service.tasks.push(newTask);
    this.newTaskAssignee = null;
    this.newTaskAssigneeMember = null;
  }

  removeTask(service: Service, taskId: string) {
    if (service.tasks) {
      service.tasks = service.tasks.filter(task => task.id !== taskId);
    }
  }

  toggleTask(service: Service, taskId: string) {
    if (service.tasks) {
      const task = service.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
      }
    }
  }

  onTaskAssignmentChange(service: Service, taskId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.assignTask(service, taskId, selectElement.value);
  }

  // Méthode pour obtenir les tâches par défaut selon le type de service
  getDefaultTasks(serviceType: string): Task[] {
    switch (serviceType) {
      case 'vidange':
        return [
          { id: '1', title: 'Vérifier le niveau d\'huile', completed: false },
          { id: '2', title: 'Changer le filtre à huile', completed: false },
          { id: '3', title: 'Remplacer l\'huile moteur', completed: false },
          { id: '4', title: 'Vérifier les fuites', completed: false }
        ];
      case 'entretien':
        return [
          { id: '1', title: 'Vérifier les niveaux de liquides', completed: false },
          { id: '2', title: 'Inspecter les freins', completed: false },
          { id: '3', title: 'Vérifier les pneus', completed: false },
          { id: '4', title: 'Contrôler les feux', completed: false },
          { id: '5', title: 'Nettoyer le filtre à air', completed: false }
        ];
      case 'réparation':
        return [
          { id: '1', title: 'Diagnostic initial', completed: false },
          { id: '2', title: 'Estimation des coûts', completed: false },
          { id: '3', title: 'Validation avec le client', completed: false },
          { id: '4', title: 'Réparation', completed: false },
          { id: '5', title: 'Test de qualité', completed: false }
        ];
      default:
        return [];
    }
  }

  // Méthode pour initialiser les tâches par défaut pour un service
  initializeDefaultTasks(service: Service) {
    if (!service.tasks || service.tasks.length === 0) {
      service.tasks = this.getDefaultTasks(service.type);
    }
  }

  assignTask(service: Service, taskId: string, teamMemberId: string) {
    const task = service.tasks.find(t => t.id === taskId);
    if (task) {
      task.assignedTo = teamMemberId;
    }
  }

  togglePartsMenu(serviceId: string) {
    this.partsMenuState[serviceId] = !this.partsMenuState[serviceId];
  }

  isPartsMenuOpen(serviceId: string): boolean {
    return this.partsMenuState[serviceId] || false;
  }

  updatePartsSearch(serviceId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.partsSearchText[serviceId] = input.value;
    this.selectedPartId = null;
  }

  addPart(service: Service, partId: string | null, quantity: string) {
    if (!partId) return;
    
    const part = this.availableParts.find(p => p.id === partId);
    if (part) {
      service.parts.push({
        ...part,
        quantity: parseInt(quantity, 10)
      });
      this.selectedPartId = null;
      this.partsSearchText[service.id] = '';
    }
  }

  removePart(service: Service, partId: string) {
    service.parts = service.parts.filter(p => p.id !== partId);
  }

  private loadAvailableParts() {
    this.http.get<Part[]>(`${environment.apiUrl}/pieces`).subscribe({
      next: (parts) => {
        this.availableParts = parts;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pièces:', error);
      }
    });
  }

  getFilteredParts(serviceId: string): Part[] {
    const searchText = this.partsSearchText[serviceId]?.toLowerCase() || '';
    return this.availableParts.filter(part => 
      part.nom.toLowerCase().includes(searchText) || 
      part.reference.toLowerCase().includes(searchText)
    );
  }

  selectPart(partId: string) {
    this.selectedPartId = partId;
  }
} 