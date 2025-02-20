import { Injectable } from '@angular/core';
import {map, Observable, of} from 'rxjs';
import {UserService} from './user.service';
import {User} from '../models/user';
import {Privilege} from '../models/privilege';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private userService: UserService) {}

  // Méthode pour récupérer l'utilisateur actuel
  getCurrentUser(): Observable<User | null> {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      return this.userService.getUserById(currentUserId); // Suppose qu'il existe une méthode getUserById dans le UserService
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
