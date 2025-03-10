  import { Routes } from '@angular/router';

  import {UsermanagementComponent} from './ui/usermanagement/usermanagement.component';
  import {DashboardComponent} from './ui/dashboard/dashboard.component';
  import {ProfileComponent} from './ui/profile/profile.component';


  export const routes: Routes = [
    { path: 'usermanagement', component: UsermanagementComponent },
    { path: '**', redirectTo: 'overview' }, // 🔹 Redirection par défaut vers "Overview"
    { path: 'dashboard', component: DashboardComponent },
    { path: 'profile', component: ProfileComponent }

  ];
