import { Role } from './role';

export interface User {
  id?: number| null ;
  keycloak_user_id : string | undefined;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: Role[]; // Liste des rôles associés
}
