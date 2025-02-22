  import { Routes } from '@angular/router';
  import {RegisterComponent} from './ui/register/register.component';
  import {LoginComponent} from './ui/login/login.component';
  import {UsermanagementComponent} from './ui/usermanagement/usermanagement.component';
  import {DashboardComponent} from './ui/dashboard/dashboard.component';

  export const routes: Routes = [
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'usermanagement', component: UsermanagementComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
  ];
