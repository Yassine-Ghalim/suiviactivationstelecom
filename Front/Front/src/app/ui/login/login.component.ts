import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private userService: UserService, private router: Router) {}

  login() {
    this.userService.getAllUsers().subscribe(users => {
      const user = users.find(u => u.email === this.email && u.password === this.password);
      if (user) {
        alert('Connexion réussie !' + user.id);
        // Store user ID in local storage
        localStorage.setItem('currentUserId', user.id);
        if (user) {
          this.router.navigate(['/dashboard']); // Redirect after login
        } else {
          alert('Non autorisé');
        }
      } else {
        alert('Identifiants incorrects');
      }
    }, error => {
      console.error('Erreur de connexion', error);
    });
  }
  logout() {
    localStorage.removeItem('currentUserId'); // Remove user session
    this.router.navigate(['/login']); // Redirect to login page
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('currentUserId') !== null;
  }
}
