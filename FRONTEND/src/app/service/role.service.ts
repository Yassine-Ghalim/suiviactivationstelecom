import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = 'http://localhost:8091/api/roles'; // Assurez-vous que cette URL correspond à ton backend

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

  // Method to fetch all roles
  async getAllRoles(): Promise<Observable<Role[]>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.get<Role[]>(`${this.apiUrl}`, httpOptions);
  }

  // Récupérer un rôle par ID
  async getRoleById(id: number): Promise<Observable<Role>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.get<Role>(`${this.apiUrl}/${id}`, httpOptions);
  }

  // Créer un nouveau rôle
  async createRole(role: Role): Promise<Observable<Role>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.post<Role>(this.apiUrl, role, httpOptions);
  }

  // Mettre à jour un rôle
  async updateRole(id: number, role: Role): Promise<Observable<Role>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role, httpOptions);
  }

  // Supprimer un rôle
  async deleteRole(id: number | null): Promise<Observable<void>> {
    const httpOptions = await this.getHttpOptions();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, httpOptions);
  }
}
