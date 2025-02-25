import {Component, OnInit} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from 'keycloak-js';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from './service/auth.service';
import {UserService} from './service/user.service';
import {Privilege} from './models/privilege'; // Importer le UserService

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

  constructor(public keycloakService: KeycloakService, private userService : UserService,private router: Router // Injection du Router
  ) {}

  ngOnInit() {
    if (this.keycloakService.isLoggedIn()) {
      this.keycloakService.loadUserProfile().then(profile => {
        this.profile = profile;
        console.log("Profil chargé", this.profile);

        this.checkUserPrivileges(this.profile.id);

      });
    }


  }


  checkUserPrivileges(keycloakUserId: string | undefined) {
    this.userService.getUserPrivileges(keycloakUserId).subscribe(privileges => {
      console.log("Privilèges de l'utilisateur:", privileges); // Log pour vérifier les privilèges récupérés

      // Vérifie si l'utilisateur a le privilège USER_VIEW
      if (privileges.includes(Privilege.USER_VIEW)) {
        this.hasUserViewPrivilege = true;
        console.log("L'utilisateur a le privilège USER_VIEW.");
        return true; // Retourne true si l'utilisateur a le privilège
      } else {
        this.hasUserViewPrivilege = false;
        this.router.navigate(['/dashboard']);

        console.log("L'utilisateur n'a pas le privilège USER_VIEW.");
        return false; // Retourne false si l'utilisateur n'a pas le privilège
      }
    }, error => {
      console.error("Erreur lors de la récupération des privilèges", error);
      this.hasUserViewPrivilege = false;
      return false; // En cas d'erreur, retourne false
    });
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
