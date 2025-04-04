export interface Piece {
  id: string;
  reference: string;
  nom: string;
  description: string;
  prix: number;
  createdAt: string;
  updatedAt: string;
  statut_livraison?: 'en_attente' | 'en_cours' | 'livree';
  date_livraison_prevue?: string;
  fournisseur?: {
    id: string;
    nom: string;
    contact: string;
  };
}

export interface PieceResponse {
  data: {
    pieces: Piece[];
  };
  error: string | null;
  status: number;
}

export interface SinglePieceResponse {
  data: {
    piece: Piece;
  };
  error: string | null;
  status: number;
}

export interface CreatePieceDto {
  reference: string;
  nom: string;
  description: string;
  prix: number;
}
