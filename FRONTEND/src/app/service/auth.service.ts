import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user';
import { Privilege } from '../models/privilege';  // Assurez-vous que Privilege est bien défini
import { KeycloakService } from 'keycloak-angular';  // Si vous utilisez Keycloak pour l'authentification
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private userService: UserService, private keycloakService: KeycloakService) {}




}
