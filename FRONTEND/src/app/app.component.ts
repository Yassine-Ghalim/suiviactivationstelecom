import { Component } from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {UserService} from './service/user.service';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms'; // Add this import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, RouterLink, HttpClientModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  // Vérifie si un utilisateur est connecté en regardant le localStorage
  isLoggedIn(): boolean {
    return localStorage.getItem('currentUserId') !== null;
    return localStorage.getItem('currentUser') !== null;
  }

  getUsername(): string {
    return localStorage.getItem('currentUser') || '';  // Retourne le nom de l'utilisateur ou une chaîne vide
  }

  // Déconnexion de l'utilisateur
  logout() {
    localStorage.removeItem('currentUser');  // Supprime le nom d'utilisateur
    localStorage.removeItem('currentUserId'); // Supprime aussi l'ID utilisateur si nécessaire
    this.router.navigate(['/login']);
  }
}
