import { Routes } from '@angular/router';

export const VIEWS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  { path: 'tickets', loadComponent: () => import('./tickets/tickets.component').then((module) => module.TicketsComponent) },
  { path: 'cuenta', loadComponent: () => import('./account/account.component').then((module) => module.AccountComponent) },
  { path: 'changelog', loadComponent: () => import('./changelog/changelog').then((module) => module.ChangelogComponent) },
];
