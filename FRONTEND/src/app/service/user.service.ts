import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user';
import {Role} from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8091/api/users'; // URL de ton API Spring Boot

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }


  // Récupérer un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouvel utilisateur
  createUser(user: { firstName: string; lastName: string; username: string }): Observable<User> {
    return this.http.post<User>('http://localhost:8091/api/users/register', user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
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


  }
