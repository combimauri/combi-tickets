import { Routes } from '@angular/router';

import { RootComponent } from './root/root.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    component: RootComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'records',
        pathMatch: 'full',
      },
      {
        path: 'records',
        loadChildren: () =>
          import('./record/record.routes').then((m) => m.recordRoutes),
      },
      {
        path: 'scanner',
        loadComponent: () =>
          import('./scanner/scanner.component').then((m) => m.ScannerComponent),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
];
