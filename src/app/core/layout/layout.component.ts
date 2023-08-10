import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { LoadingState } from '../states/loading.state';

@Component({
  selector: 'combi-layout',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatToolbarModule,
    NgIf,
    RouterLink,
  ],
  template: `
    <ng-container *ngIf="signOut$ | async"></ng-container>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <mat-nav-list>
          <div>
            <a mat-list-item routerLink="/records"> Records </a>
            <a mat-list-item routerLink="/credentials"> Credentials </a>
          </div>

          <a mat-list-item (click)="signOut()">
            <div class="sign-out__btn-content">
              Sign Out
              <mat-icon aria-label="Sign out icon">logout</mat-icon>
            </div>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            *ngIf="isHandset$ | async"
            mat-icon-button
            type="button"
            aria-label="Toggle sidenav"
            (click)="drawer.toggle()"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <a mat-button class="nav-title" routerLink="/"> Combi Tickets </a>

          <div *ngIf="loading()" class="spinner-container">
            <mat-spinner class="title-spinner"></mat-spinner>
          </div>

          <a
            mat-icon-button
            type="button"
            aria-label="Access scanner"
            class="scanner-button"
            routerLink="/scanner"
          >
            <mat-icon aria-label="Side nav toggle icon"
              >qr_code_scanner</mat-icon
            >
          </a>
        </mat-toolbar>

        <div class="content-container">
          <ng-content></ng-content>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100%;
      }

      .sidenav {
        width: 200px;

        .mat-toolbar {
          background: inherit;
        }
      }

      .mat-toolbar.mat-primary {
        position: sticky;
        top: 0;
        z-index: 2;
      }

      .mat-mdc-nav-list {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
      }

      .spinner-container {
        box-sizing: border-box;
        height: 100%;
        padding: 16px 0;

        .mat-mdc-progress-spinner.title-spinner {
          --mdc-circular-progress-active-indicator-color: #ffffff;
          max-height: 100%;
        }
      }

      .nav-title {
        font-size: 1.25rem;
      }

      .scanner-button {
        margin-left: auto;
      }

      .sign-out__btn-content {
        align-items: center;
        display: flex;
        gap: 8px;
      }

      .content-container {
        padding: 15px;
      }
    `,
  ],
})
export class LayoutComponent {
  loading = inject(LoadingState).loading;

  private breakpointObserver = inject(BreakpointObserver);
  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay(),
  );

  private auth = inject(AuthService);
  private signOutSubject$ = new Subject<void>();
  signOut$ = this.signOutSubject$.pipe(
    switchMap(() => this.auth.signOut()),
    tap(() => this.handleSignOutResponse()),
  );

  private router = inject(Router);

  signOut(): void {
    this.signOutSubject$.next();
  }

  private handleSignOutResponse(): void {
    this.router.navigate(['/login']);
  }
}
