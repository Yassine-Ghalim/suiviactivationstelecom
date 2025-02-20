import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import { FormsModule } from '@angular/forms';  // Ensure this is imported
import { HttpClientModule } from '@angular/common/http'; // Add this import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, RouterLink,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Front';
}
