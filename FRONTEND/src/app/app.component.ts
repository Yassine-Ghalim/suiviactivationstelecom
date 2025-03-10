import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from './service/user.service';
import { Privilege } from './models/privilege';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink
  ],
  standalone: true
})
export class AppComponent implements OnInit {

  title = 'angular-app';
  public profile!: KeycloakProfile;


  hasUserViewPrivilege: boolean = false;

  constructor(
    public keycloakService: KeycloakService,
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (await this.keycloakService.isLoggedIn()) {
      this.profile = await this.keycloakService.loadUserProfile();
      console.log("Profil chargé", this.profile);
      await this.checkUserPrivileges(this.profile.id);
    }
  }

  async checkUserPrivileges(keycloakUserId: string | undefined) {
    if (!keycloakUserId) {
      console.error('Keycloak User ID is undefined');
      this.hasUserViewPrivilege = false;
      this.router.navigate(['/dashboard']); // Navigate to dashboard if no user ID
      return;
    }

    try {
      // Fetch user privileges
      const privileges = await (await this.userService.getUserPrivileges(keycloakUserId)).toPromise();
      console.log("Privilèges de l'utilisateur:", privileges);

      // Check if the user has the USER_VIEW privilege
      if (privileges && privileges.includes(Privilege.USER_VIEW)) {
        this.hasUserViewPrivilege = true;
        console.log("L'utilisateur a le privilège USER_VIEW.");
      } else {
        this.hasUserViewPrivilege = false;
        console.log("L'utilisateur n'a pas le privilège USER_VIEW.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des privilèges", error);
      this.hasUserViewPrivilege = false;
    } finally {
      // Navigate to the dashboard after checking privileges or handling errors
      this.router.navigate(['/dashboard']);
    }
  }

  async handleLogin() {
    if (typeof window !== 'undefined' && window.location) {
      await this.keycloakService.login({
        redirectUri: window.location.origin
      });
    } else {
      console.error('Window or location is not available.');
    }
  }

  handleLogout() {
    if (typeof window !== 'undefined' && window.location) {
      this.keycloakService.logout(window.location.origin);
    } else {
      console.error('Window or location is not available.');
    }
  }
}
