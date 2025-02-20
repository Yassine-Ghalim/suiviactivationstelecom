import { Component } from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import { FormsModule } from '@angular/forms';  // Ensure this is imported
import { HttpClientModule } from '@angular/common/http';
import {UserService} from './service/user.service'; // Add this import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, RouterLink,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Front';
  constructor( private router: Router) {}

  isLoggedIn(): boolean {
    return localStorage.getItem('currentUserId') !== null;
  }

  logout() {
    localStorage.removeItem('currentUserId');
    this.router.navigate(['/login']);
  }
}
