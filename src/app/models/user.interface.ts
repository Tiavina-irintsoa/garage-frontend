export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  CLIENT = 'CLIENT',
  MECANICIEN = 'MECANICIEN',
  MANAGER = 'MANAGER',
}

export interface AuthResponse {
  data: {
    user?: User;
    token?: string;
    message?: string;
    email?: string;
  };
  error: null | string;
  status: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: UserRole;
}

export interface VerifyEmailCredentials {
  email: string;
  code: string;
}
