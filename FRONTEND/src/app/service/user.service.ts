import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {User} from '../models/user';
import {Role} from '../models/role';
import {Privilege} from '../models/privilege';
import {KeycloakService} from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8091/api/users'; // URL de ton API Spring Boot

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }


  // Récupérer un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouvel utilisateur
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user, this.getHttpOptions());
  }

  // Mettre à jour un utilisateur
  updateUser(id: number | undefined, user: { firstName: string; lastName: string; username: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // Supprimer un utilisateur
  deleteUser(userId: number | null | undefined): Observable<any> {
    return this.http.delete(`http://localhost:8091/api/users/${userId}`, { responseType: 'text' });
  }

  assignRoleToUser(userId: number, roleId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
  }

  getUserByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?email=${email}`);
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }


  // Method to get user privileges by Keycloak user ID
  getUserPrivileges(keycloakUserId: string | undefined): Observable<Privilege[]> {
    return this.http.get<Privilege[]>(`${this.apiUrl}/privileges/${keycloakUserId}`);
  }


  getUserByKeycloakId(keycloakId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${keycloakId}`);
  }





}
