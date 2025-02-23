import { Role } from './role';

export interface User {
  id?: number| null ;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: Role[]; // Liste des rôles associés
}
