import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { KeycloakService } from 'keycloak-angular';
import {Privilege} from '../models/privilege';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8091/api/users'; // URL de ton API Spring Boot

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  // Method to get HTTP options with the authorization header
  private async getHttpOptions(): Promise<{ headers: HttpHeaders }> {
    const token = await this.keycloakService.getToken();
    console.log('JWT Token:', token); // Log the token for debugging
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<Observable<User[]>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.get<User[]>(`${this.apiUrl}/all`, httpOptions);
  }

  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<Observable<User>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.get<User>(`${this.apiUrl}/${id}`, httpOptions);
  }

  // Créer un nouvel utilisateur
  async createUser(user: User): Promise<Observable<User>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.post<User>(`${this.apiUrl}/register`, user, httpOptions);
  }

  // Mettre à jour un utilisateur
  async updateUser(id: number | undefined, user: { firstName: string; lastName: string; username: string }): Promise<Observable<User>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, httpOptions);
  }

  // Supprimer un utilisateur
  async deleteUser(userId: number | null | undefined): Promise<Observable<any>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.delete(`${this.apiUrl}/${userId}`, httpOptions);
  }

  // Assigner un rôle à un utilisateur
  async assignRoleToUser(userId: number, roleId: number): Promise<Observable<User>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.post<User>(`${this.apiUrl}/${userId}/roles/${roleId}`, {}, httpOptions);
  }

  // Vérifier si un utilisateur existe par email
  async getUserByEmail(email: string): Promise<Observable<boolean>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.get<boolean>(`${this.apiUrl}/exists?email=${email}`, httpOptions);
  }

  // Récupérer les privilèges d'un utilisateur par Keycloak ID
  async getUserPrivileges(keycloakUserId: string | undefined): Promise<Observable<Privilege[]>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.get<Privilege[]>(`${this.apiUrl}/privileges/${keycloakUserId}`, httpOptions);
  }

  // Récupérer un utilisateur par Keycloak ID
  async getUserByKeycloakId(keycloakId: string): Promise<Observable<User>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.get<User>(`${this.apiUrl}/${keycloakId}`, httpOptions);
  }
}
