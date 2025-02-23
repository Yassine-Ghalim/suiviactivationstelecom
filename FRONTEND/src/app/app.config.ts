import {APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {RoleService} from './service/role.service';
import {UserService} from './service/user.service';
import {KeycloakService} from 'keycloak-angular';



export const appConfig: ApplicationConfig = {

  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),  // Configuration HTTP avec fetch
    UserService,  // Ajoutez ici vos services
    RoleService,

  ]
};
