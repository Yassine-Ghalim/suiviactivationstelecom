import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: User = {
    id: '',
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    enabled: true,
    emailVerified: false,
    roles: []
  };

  constructor(private userService: UserService, private router: Router) {}

  register() {
    this.userService.createUser(this.user).subscribe(() => {
      alert('Inscription réussie !');
      this.router.navigate(['/login']); // Redirection vers la page de connexion
    }, error => {
      console.error('Erreur d\'inscription', error);
    });
  }
}
