import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PieceService } from '../../../../services/piece.service';
import { Piece, CreatePieceDto } from '../../../../models/piece.interface';
import { ToastService } from '../../../../services/toast.service';
import { ToastComponent } from '../../../shared/toast/toast.component';

@Component({
  selector: 'app-gestion-pieces',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './gestion-pieces.component.html',
  styleUrls: ['./gestion-pieces.component.scss'],
})
export class GestionPiecesComponent implements OnInit {
  pieces: Piece[] = [];
  filteredPieces: Piece[] = [];
  pieceForm: FormGroup;
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  error: string | null = null;
  editingPiece: Piece | null = null;

  constructor(
    private pieceService: PieceService,
    private fb: FormBuilder,
    public toast: ToastService
  ) {
    this.pieceForm = this.fb.group({
      reference: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      description: ['', [Validators.required]],
      prix: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadPieces();
  }

  loadPieces(): void {
    this.isLoading = true;
    this.pieceService.getPieces().subscribe({
      next: (pieces) => {
        this.pieces = pieces;
        this.filterAndPaginatePieces();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des pièces';
        this.toast.error(this.error);
        this.isLoading = false;
      },
    });
  }

  filterAndPaginatePieces(): void {
    let filtered = this.pieces;
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = this.pieces.filter(
        (piece) =>
          piece.reference.toLowerCase().includes(search) ||
          piece.nom.toLowerCase().includes(search) ||
          piece.description.toLowerCase().includes(search)
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredPieces = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.filterAndPaginatePieces();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filterAndPaginatePieces();
  }

  onSubmit(): void {
    if (this.pieceForm.valid) {
      this.isLoading = true;
      const pieceData: CreatePieceDto = this.pieceForm.value;

      if (this.editingPiece) {
        this.pieceService
          .updatePiece(this.editingPiece.id, pieceData)
          .subscribe({
            next: (updatedPiece) => {
              const index = this.pieces.findIndex(
                (p) => p.id === updatedPiece.id
              );
              if (index !== -1) {
                this.pieces[index] = updatedPiece;
                this.filterAndPaginatePieces();
              }
              this.toast.success('Pièce mise à jour avec succès');
              this.resetForm();
            },
            error: (error) => {
              this.toast.error('Erreur lors de la mise à jour de la pièce');
              this.isLoading = false;
            },
          });
      } else {
        this.pieceService.createPiece(pieceData).subscribe({
          next: (newPiece) => {
            this.pieces.unshift(newPiece);
            this.filterAndPaginatePieces();
            this.toast.success('Pièce créée avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.toast.error('Erreur lors de la création de la pièce');
            this.isLoading = false;
          },
        });
      }
    }
  }

  editPiece(piece: Piece): void {
    this.editingPiece = piece;
    this.pieceForm.patchValue({
      reference: piece.reference,
      nom: piece.nom,
      description: piece.description,
      prix: piece.prix,
    });
  }

  deletePiece(piece: Piece): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pièce ?')) {
      this.isLoading = true;
      this.pieceService.deletePiece(piece.id).subscribe({
        next: () => {
          this.pieces = this.pieces.filter((p) => p.id !== piece.id);
          this.filterAndPaginatePieces();
          this.toast.success('Pièce supprimée avec succès');
          this.isLoading = false;
        },
        error: (error) => {
          this.toast.error('Erreur lors de la suppression de la pièce');
          this.isLoading = false;
        },
      });
    }
  }

  resetForm(): void {
    this.pieceForm.reset();
    this.editingPiece = null;
    this.isLoading = false;
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
