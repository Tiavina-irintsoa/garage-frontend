export interface Piece {
  id: string;
  reference: string;
  nom: string;
  description: string;
  prix: number;
  createdAt: string;
  updatedAt: string;
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
