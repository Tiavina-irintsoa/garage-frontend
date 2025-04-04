import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, map } from 'rxjs';
import {
  Piece,
  PieceResponse,
  SinglePieceResponse,
  CreatePieceDto,
} from '../models/piece.interface';

export interface PiecesResponse {
  data: {
    pieces: Piece[];
  };
  error: null | string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class PieceService {
  constructor(private http: HttpService) {}

  getPieces(): Observable<Piece[]> {
    return this.http
      .authenticatedGet<PieceResponse>('/pieces')
      .pipe(map((response) => response.data.pieces));
  }

  createPiece(piece: CreatePieceDto): Observable<Piece> {
    return this.http
      .authenticatedPost<SinglePieceResponse>('/pieces', piece)
      .pipe(map((response) => response.data.piece));
  }

  updatePiece(id: string, piece: CreatePieceDto): Observable<Piece> {
    return this.http
      .authenticatedPut<SinglePieceResponse>(`/pieces/${id}`, piece)
      .pipe(map((response) => response.data.piece));
  }

  deletePiece(id: string): Observable<void> {
    return this.http.authenticatedDelete<void>(`/pieces/${id}`);
  }

  getAllPieces(): Observable<Piece[]> {
    return this.http
      .get<PiecesResponse>('/pieces')
      .pipe(map((response) => response.data.pieces));
  }
}
