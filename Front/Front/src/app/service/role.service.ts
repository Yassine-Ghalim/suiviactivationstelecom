import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:8091/api/roles'; // Assurez-vous que cette URL correspond à ton backend

  constructor(private http: HttpClient) {}

  // Récupérer tous les rôles
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  // Récupérer un rôle par ID
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau rôle
  createRole(role: { roleName: string; description: string; privileges: string[] }): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }


  // Mettre à jour un rôle
  updateRole(id: string, role: { roleName: string; description: string }): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  // Supprimer un rôle
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
