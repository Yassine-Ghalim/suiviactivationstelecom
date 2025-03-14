import { Privilege } from './privilege';

export interface Role {
  id: number | null;
  role: string; // Nom du rôle (ex: ROLE_ADMIN, ROLE_USER)
  description: string; // Description du rôle
  privileges: Privilege[]; // Liste des privilèges du rôle
}
