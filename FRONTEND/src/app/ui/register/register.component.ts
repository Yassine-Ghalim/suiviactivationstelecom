import { Component } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    id: null ,
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    enabled: true,
    emailVerified: false,
    roles: [] // Add roles if needed, e.g. ['USER'] for a default role
  };

  constructor(private userService: UserService, private router: Router) {}

  // Simple form validation for required fields
  isFormValid() {
    return this.user.username && this.user.email && this.user.password && this.user.firstName && this.user.lastName;
  }

  register() {
    if (this.isFormValid()) {
      this.userService.createUser(this.user).subscribe(() => {
        alert('Inscription réussie !');
        this.router.navigate(['/login']); // Redirect to login page
      }, error => {
        console.error('Erreur d\'inscription', error);
        alert('Erreur lors de l\'inscription. Veuillez réessayer.');
      });
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  }
}
