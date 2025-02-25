import {APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {RoleService} from './service/role.service';
import {UserService} from './service/user.service';
import {KeycloakService} from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'bdcc-realm',
        clientId: 'auth-service',
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      },
      loadUserProfileAtStartUp: true
    });
}




export const appConfig: ApplicationConfig = {

  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,   // Configuration HTTP avec fetch
      deps: [KeycloakService],
      multi: true
    },

    UserService,  // Ajoutez ici vos services
    RoleService,
    KeycloakService

  ]
};
