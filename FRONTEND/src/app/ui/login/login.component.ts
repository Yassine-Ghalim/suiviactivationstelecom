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
        alert('Connexion réussie ! ' + 'Bienvenue Mr (Mm) ' + user.username);

        // Check if user.id is not null before storing
        if (user.id !== null && user.id !== undefined) {
          console.log("User ID to store:", user.id);
          localStorage.setItem('currentUserId', user.id.toString());  // Store user ID
          localStorage.setItem('currentUser', user.username);  // Store user username

          // Check if currentUserId is correctly stored
          setTimeout(() => {
            console.log("Stored currentUserId:", localStorage.getItem('currentUserId'));
          }, 1000); // Wait 1 second to check if it's set
        } else {
          console.error('User ID is null or undefined');
          alert('Problème avec l\'ID de l\'utilisateur');
        }

        this.router.navigate(['/usermanagement']); // Redirect after login
      } else {
        alert('Identifiants incorrects');
      }
    }, error => {
      console.error('Erreur de connexion', error);
    });
  }



}
