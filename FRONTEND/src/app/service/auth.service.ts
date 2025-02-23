import { Injectable } from '@angular/core';
import {map, Observable, of} from 'rxjs';
import {UserService} from './user.service';
import {User} from '../models/user';
import {Privilege} from '../models/privilege';
import {KeycloakService} from 'keycloak-angular';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private userService: UserService) {}

  // Méthode pour récupérer l'utilisateur actuel
  getCurrentUser(): Observable<User | null> {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      const userId = Number(currentUserId); // Convert the string to a number
      if (!isNaN(userId)) { // Ensure it's a valid number
        return this.userService.getUserById(userId); // Use the number type ID
      }
    }
    return of(null);
  }


  // Vérifier les privilèges de l'utilisateur
  hasPrivilege(privilege: Privilege): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        if (user) {
          // Vérifier si l'utilisateur a le privilège demandé
          return user.roles.some(role => role.privileges.includes(privilege));
        }
        return false;
      })
    );
  }


}
