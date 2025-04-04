import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  RepairService,
  Repair,
  RepairStatus,
  RepairResponse,
} from '../../services/repair.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { PieceService } from '../../services/piece.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  statut_livraison?: 'en_attente' | 'en_cours' | 'livree';
  date_livraison_prevue?: Date;
  fournisseur?: {
    id: string;
    nom: string;
    contact: string;
  };
}

interface Service {
  id: string;
  type: 'entretien' | 'réparation' | 'vidange';
  estimatedDuration: number;
  estimatedPrice: number;
  tasks: Task[];
}

interface KanbanCard {
  id: string;
  clientName: string;
  carInfo: string;
  status: string;
  createdAt: Date;
  deadline?: Date;
  description?: string;
  clientPhone?: string;
  clientEmail?: string;
  licensePlate?: string;
  mileage?: number;
  serviceType?: 'entretien' | 'réparation' | 'vidange';
  estimatedPrice?: number | null;
  montant_total?: number | null;
  date_facturation?: string | null;
  assignedTeam?: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  services?: Service[];
  parts: Part[];
  pieces_facture?: Array<{
    id: string;
    prix: number;
    quantite: number;
    reference?: string;
    nom?: string;
    description?: string;
  }>;
  montant_pieces?: number | null;
  invoiceUrl?: string;
  images?: string[];
}

type RepairCard = KanbanCard;

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
  imports: [
    CommonModule,
    DragDropModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css'],
})
export class KanbanComponent implements OnInit {
  @ViewChild('assigneeSelect') assigneeSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('newTaskInput') newTaskInput!: ElementRef<HTMLInputElement>;
  @ViewChild('quantityInput') quantityInput!: ElementRef<HTMLInputElement>;

  columns: KanbanColumn[] = [
    {
      id: 'ATTENTE_ASSIGNATION',
      title: "En attente d'assignation",
      count: 0,
      color: 'bg-yellow-100',
      cards: [],
    },
    {
      id: 'ATTENTE_FACTURATION',
      title: 'En attente de facturation',
      count: 0,
      color: 'bg-purple-100',
      cards: [],
    },
    {
      id: 'PAYE',
      title: 'Payés',
      count: 0,
      color: 'bg-green-100',
      cards: [],
    },
    {
      id: 'EN_COURS',
      title: 'En cours',
      count: 0,
      color: 'bg-blue-100',
      cards: [],
    },
    {
      id: 'TERMINEE',
      title: 'Terminés',
      count: 0,
      color: 'bg-gray-100',
      cards: [],
    },
  ];

  isLoading = true;
  isLoadingDetails = false;

  private assigneeMenuState: { [key: string]: boolean } = {};
  private partsMenuState: { [key: string]: boolean } = {};
  private partsSearchText: { [key: string]: string } = {};
  private selectedPartId: string | null = null;

  availableParts: Part[] = [];

  // Ajout des propriétés pour l'autocomplétion
  partsSearchControl = new FormControl('');
  filteredParts: Part[] = [];
  selectedPart: Part | null = null;

  constructor(
    private repairService: RepairService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private pieceService: PieceService
  ) {
    // Configuration de l'autocomplétion
    this.partsSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        if (searchTerm) {
          this.filteredParts = this.filterParts(searchTerm);
        } else {
          this.filteredParts = [];
        }
      });
  }

  ngOnInit() {
    this.loadRepairs();
    this.loadAvailableParts();
  }

  private loadRepairs() {
    this.isLoading = true;
    const statuses: RepairStatus[] = [
      'ATTENTE_ASSIGNATION',
      'ATTENTE_FACTURATION',
      'PAYE',
      'EN_COURS',
      'TERMINEE',
    ];

    statuses.forEach((status) => {
      this.repairService.getRepairsByStatus(status).subscribe({
        next: (response: RepairResponse) => {
          if (response?.data?.demandes) {
            const column = this.columns.find((col) => col.id === status);
            if (column) {
              column.cards = response.data.demandes.map((repair) =>
                this.mapRepairToCard(repair)
              );
              column.count = column.cards.length;
            }
            // Vérifier si toutes les colonnes sont chargées
            if (this.columns.every((col) => col.cards.length >= 0)) {
              this.isLoading = false;
            }
          }
        },
        error: (error) => {
          console.error(`Error loading repairs for status ${status}:`, error);
          this.isLoading = false;
        },
      });
    });
  }

  private mapRepairToCard(repair: Repair): RepairCard {
    // Déterminer le statut en fonction de la présence de reference_paiement et du montant total
    let status: RepairStatus;
    if (repair.reference_paiement) {
      status = 'PAYE';
    } else if (repair.montant_total !== null) {
      status = 'ATTENTE_FACTURATION';
    } else {
      status = 'ATTENTE_ASSIGNATION';
    }

    return {
      id: repair.id,
      clientName: `${repair.client.prenom} ${repair.client.nom}`,
      carInfo: `${repair.vehicule.marque.libelle} ${repair.vehicule.modele.libelle} - ${repair.vehicule.immatriculation}`,
      createdAt: new Date(repair.date_rdv),
      status: status,
      serviceType: 'réparation',
      estimatedPrice:
        status === 'ATTENTE_FACTURATION'
          ? null
          : repair.montant_total || repair.estimation.cout_estime,
      services: [],
      parts: [],
      clientEmail: repair.client.email,
      description: repair.description,
      deadline: new Date(repair.deadline),
      pieces_facture: repair.pieces_facture || [],
      montant_pieces: repair.montant_pieces,
      montant_total: repair.montant_total,
      date_facturation: repair.date_facturation,
    };
  }

  // Définir l'ordre des états et les transitions autorisées
  stateTransitions: { [key: string]: RepairStatus[] } = {
    ATTENTE_ASSIGNATION: ['ATTENTE_FACTURATION'],
    ATTENTE_FACTURATION: ['PAYE', 'ATTENTE_ASSIGNATION'],
    PAYE: ['EN_COURS'],
    EN_COURS: ['TERMINEE'],
    TERMINEE: ['EN_COURS'],
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
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const fromColumnId = event.previousContainer.id;
      const toColumnId = event.container.id;

      if (this.isValidMove(fromColumnId, toColumnId)) {
        const card = event.previousContainer.data[event.previousIndex];

        // Mettre à jour le statut via l'API
        this.repairService
          .updateRepairStatus(card.id, toColumnId as RepairStatus)
          .subscribe({
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
            },
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
    this.columns.forEach((column) => {
      column.count = column.cards.length;
    });
  }

  getServiceTypeBadgeClass(
    serviceType: 'entretien' | 'réparation' | 'vidange' | undefined
  ): string {
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
      year: 'numeric',
    }).format(date);
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '0';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
    }).format(price);
  }

  formatMileage(mileage: number | undefined): string {
    if (!mileage) return '0';
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
  }

  selectedProject: KanbanCard | null = null;

  openProjectModal(card: RepairCard) {
    if (!card) return;

    this.selectedProject = {
      id: card.id,
      clientName: card.clientName,
      carInfo: card.carInfo,
      status: card.status,
      createdAt: card.createdAt,
      deadline: card.deadline || new Date(),
      description: card.description || '',
      clientPhone: card.clientPhone || '',
      clientEmail: card.clientEmail || '',
      licensePlate: card.licensePlate || '',
      mileage: card.mileage || 0,
      estimatedPrice: card.estimatedPrice || 0,
      assignedTeam: card.assignedTeam || [],
      services: [],
      parts: [],
      images: [],
      invoiceUrl: undefined,
      pieces_facture: [],
      montant_pieces: 0,
      montant_total: 0,
      date_facturation: card.date_facturation,
    };
    this.isLoadingDetails = true;

    // Charger les détails
    this.repairService.getRepairDetail(card.id).subscribe({
      next: (response) => {
        if (!response?.data?.demande) {
          this.isLoadingDetails = false;
          return;
        }

        const repair = response.data.demande;

        // Convertir les services en format attendu par la modal
        const services: Service[] = repair.services.map((service) => ({
          id: service.id,
          type: this.mapServiceType(service.titre),
          estimatedDuration: service.temps_base,
          estimatedPrice: service.cout_base,
          tasks: [],
        }));

        // Convertir les pièces en format attendu
        const parts: Part[] =
          repair.pieces_facture?.map((piece) => ({
            id: piece.id,
            reference: piece.reference || '',
            nom: piece.nom || '',
            description: piece.description || '',
            prix: piece.prix,
            quantity: piece.quantite,
          })) || [];

        if (this.selectedProject) {
          this.selectedProject = {
            ...this.selectedProject,
            services: services,
            parts: parts,
            pieces_facture: repair.pieces_facture || [],
            montant_pieces: repair.montant_pieces || 0,
            montant_total: repair.montant_total || 0,
            description: repair.description || '',
            images: repair.images || [],
            date_facturation: repair.date_facturation || '',
          };
        }

        this.isLoadingDetails = false;
      },
      error: (error) => {
        console.error('Error loading repair details:', error);
        this.isLoadingDetails = false;
      },
    });
  }

  private mapServiceType(
    titre: string
  ): 'entretien' | 'réparation' | 'vidange' {
    const type = titre.toLowerCase();
    if (type.includes('vidange')) return 'vidange';
    if (type.includes('entretien')) return 'entretien';
    return 'réparation';
  }

  closeProjectModal() {
    if (!this.selectedProject) {
      return;
    }

    const currentColumn = this.columns.find((col) =>
      col.cards.some((card) => card.id === this.selectedProject?.id)
    );

    // Si le ticket est dans "En attente d'assignation"
    if (currentColumn?.id === 'ATTENTE_ASSIGNATION') {
      const projectId = this.selectedProject.id;
      // Créer une facture vide
      this.repairService.updateRepairBill(projectId, []).subscribe({
        next: () => {
          // Déplacer vers "En attente de facturation"
          this.repairService
            .updateRepairStatus(projectId, 'ATTENTE_FACTURATION')
            .subscribe({
              next: () => {
                // Mettre à jour l'interface utilisateur
                if (currentColumn) {
                  const cardIndex = currentColumn.cards.findIndex(
                    (card) => card.id === projectId
                  );
                  if (cardIndex !== -1) {
                    const card = currentColumn.cards[cardIndex];
                    currentColumn.cards.splice(cardIndex, 1);
                    currentColumn.count--;

                    const targetColumn = this.columns.find(
                      (col) => col.id === 'ATTENTE_FACTURATION'
                    );
                    if (targetColumn) {
                      targetColumn.cards.push({
                        ...card,
                        status: 'ATTENTE_FACTURATION',
                      });
                      targetColumn.count++;
                    }
                  }
                }
              },
              error: (error) => {
                console.error(
                  'Erreur lors de la mise à jour du statut:',
                  error
                );
              },
            });
        },
        error: (error) => {
          console.error('Erreur lors de la création de la facture:', error);
        },
      });
    }
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
    const task = service.tasks.find((t) => t.id === taskId);
    if (task && this.selectedProject?.assignedTeam) {
      task.assignedTo = memberId;
      task.assignedMember = this.selectedProject.assignedTeam.find(
        (m) => m.id === memberId
      );
    }
    this.toggleAssigneeMenu(taskId);
  }

  setNewTaskAssignee(memberId: string) {
    this.newTaskAssignee = memberId;
    if (this.selectedProject?.assignedTeam) {
      const member = this.selectedProject.assignedTeam.find(
        (m) => m.id === memberId
      );
      this.newTaskAssigneeMember = member || null;
    }
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
      assignedMember: this.newTaskAssigneeMember || undefined,
    };

    service.tasks.push(newTask);
    this.newTaskAssignee = null;
    this.newTaskAssigneeMember = null;
  }

  removeTask(service: Service, taskId: string) {
    if (service.tasks) {
      service.tasks = service.tasks.filter((task) => task.id !== taskId);
    }
  }

  toggleTask(service: Service, taskId: string) {
    if (service.tasks) {
      const task = service.tasks.find((t) => t.id === taskId);
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
          { id: '1', title: "Vérifier le niveau d'huile", completed: false },
          { id: '2', title: 'Changer le filtre à huile', completed: false },
          { id: '3', title: "Remplacer l'huile moteur", completed: false },
          { id: '4', title: 'Vérifier les fuites', completed: false },
        ];
      case 'entretien':
        return [
          {
            id: '1',
            title: 'Vérifier les niveaux de liquides',
            completed: false,
          },
          { id: '2', title: 'Inspecter les freins', completed: false },
          { id: '3', title: 'Vérifier les pneus', completed: false },
          { id: '4', title: 'Contrôler les feux', completed: false },
          { id: '5', title: 'Nettoyer le filtre à air', completed: false },
        ];
      case 'réparation':
        return [
          { id: '1', title: 'Diagnostic initial', completed: false },
          { id: '2', title: 'Estimation des coûts', completed: false },
          { id: '3', title: 'Validation avec le client', completed: false },
          { id: '4', title: 'Réparation', completed: false },
          { id: '5', title: 'Test de qualité', completed: false },
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
    const task = service.tasks.find((t) => t.id === taskId);
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

  private loadAvailableParts() {
    this.pieceService.getAllPieces().subscribe({
      next: (pieces) => {
        this.availableParts = pieces.map((piece) => ({
          id: piece.id,
          reference: piece.reference,
          nom: piece.nom,
          description: piece.description,
          prix: piece.prix,
          quantity: 0,
          statut_livraison: piece.statut_livraison,
          date_livraison_prevue: piece.date_livraison_prevue
            ? new Date(piece.date_livraison_prevue)
            : undefined,
          fournisseur: piece.fournisseur,
        }));
        console.log('Pièces chargées:', this.availableParts);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pièces:', error);
      },
    });
  }

  getFilteredParts(serviceId: string): Part[] {
    const searchText = this.partsSearchText[serviceId]?.toLowerCase() || '';
    return this.availableParts.filter(
      (part) =>
        part.nom.toLowerCase().includes(searchText) ||
        part.reference.toLowerCase().includes(searchText)
    );
  }

  selectPart(part: Part) {
    this.selectedPart = part;
    this.partsSearchControl.setValue(`${part.reference} - ${part.nom}`, {
      emitEvent: false,
    });
    this.filteredParts = [];
  }

  // Méthode de filtrage des pièces
  private filterParts(searchTerm: string): Part[] {
    const term = searchTerm.toLowerCase();
    return this.availableParts.filter(
      (part) =>
        part.reference.toLowerCase().includes(term) ||
        part.nom.toLowerCase().includes(term) ||
        part.description.toLowerCase().includes(term)
    );
  }

  // Méthode d'ajout d'une pièce
  addPartToRepair(quantity: number, unitPrice: number) {
    if (!this.selectedPart || quantity <= 0 || !this.selectedProject) return;

    // Ajouter ou mettre à jour la pièce dans la demande
    const existingPart = this.selectedProject.parts.find(
      (p) => p.id === this.selectedPart?.id
    );
    if (existingPart) {
      existingPart.quantity += quantity;
      existingPart.prix = unitPrice; // Mettre à jour le prix unitaire
    } else if (this.selectedPart) {
      this.selectedProject.parts.push({
        ...this.selectedPart,
        quantity,
        prix: unitPrice, // Utiliser le prix unitaire personnalisé
      });
    }

    // Préparer les données pour la facture
    const allParts = this.selectedProject.parts.map((part) => ({
      id: part.id,
      prix: part.prix,
      quantite: part.quantity,
    }));

    // Mettre à jour la facture
    this.repairService
      .updateRepairBill(this.selectedProject.id, allParts)
      .subscribe({
        next: (response) => {
          if (response.data && this.selectedProject) {
            this.selectedProject.pieces_facture = response.data.pieces_facture;
            this.selectedProject.montant_pieces = response.data.montant_pieces;
            this.selectedProject.montant_total = response.data.montant_total;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la facture:', error);
        },
      });

    // Réinitialiser la sélection
    this.selectedPart = null;
    this.partsSearchControl.setValue('');
    this.updateTotalPrice();
  }

  // Méthode de suppression d'une pièce
  removePartFromRepair(partId: string) {
    if (!this.selectedProject) return;

    this.selectedProject.parts = this.selectedProject.parts.filter(
      (p) => p.id !== partId
    );

    // Préparer les données pour la facture
    const allParts = this.selectedProject.parts.map((part) => ({
      id: part.id,
      prix: part.prix,
      quantite: part.quantity,
    }));

    // Mettre à jour la facture
    this.repairService
      .updateRepairBill(this.selectedProject.id, allParts)
      .subscribe({
        next: (response) => {
          if (response.data && this.selectedProject) {
            this.selectedProject.pieces_facture = response.data.pieces_facture;
            this.selectedProject.montant_pieces = response.data.montant_pieces;
            this.selectedProject.montant_total = response.data.montant_total;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la facture:', error);
        },
      });

    this.updateTotalPrice();
  }

  // Méthode de mise à jour du prix total
  private updateTotalPrice() {
    if (!this.selectedProject) return;

    const partsTotal = this.selectedProject.parts.reduce((total, part) => {
      return total + part.prix * part.quantity;
    }, 0);

    this.selectedProject.montant_pieces = partsTotal;
    this.selectedProject.montant_total = partsTotal; // À adapter selon votre logique de calcul du total
  }

  // Méthode pour obtenir le statut de livraison formaté
  getStatutLivraison(statut?: 'en_attente' | 'en_cours' | 'livree'): string {
    switch (statut) {
      case 'en_attente':
        return 'En attente de livraison';
      case 'en_cours':
        return 'Livraison en cours';
      case 'livree':
        return 'Livrée';
      default:
        return 'Statut inconnu';
    }
  }

  // Méthode pour vérifier si une pièce est disponible
  isPieceDisponible(part: Part): boolean {
    return part.statut_livraison === 'livree';
  }

  calculateTotalPrice(parts: any[]): number {
    if (!parts) return 0;
    return parts.reduce((total, part) => total + part.prix * part.quantity, 0);
  }
}
