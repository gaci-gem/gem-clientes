import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { VerticalLayout } from './layouts/vertical-layout/vertical-layout';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./views/auth/login.component').then((module) => module.LoginComponent) },
  { path: '', component: VerticalLayout, canActivate: [authGuard], loadChildren: () => import('./views/views.route').then((module) => module.VIEWS_ROUTES) },
  { path: '**', redirectTo: '' },
];
