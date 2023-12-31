import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { RootComponent } from './root/root.component';

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
        path: 'credentials',
        loadComponent: () =>
          import('./credentials/credentials.component').then(
            (m) => m.CredentialsComponent,
          ),
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
    loadChildren: () =>
      import('./login/login.routes').then((m) => m.loginRoutes),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
