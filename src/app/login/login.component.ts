import { AsyncPipe, NgIf } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Subject, switchMap, tap } from 'rxjs';

import { AuthService } from '../core/services/auth.service';
import { LoadingState } from '../core/states/loading.state';

@Component({
  selector: 'combi-login',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <ng-container *ngIf="signIn$ | async"></ng-container>

    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            Combi Tickets
            <mat-spinner *ngIf="loading()" class="title-spinner"></mat-spinner>
          </mat-card-title>

          <mat-card-subtitle> Login </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="signIn()">
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" />
            </mat-form-field>

            <div class="submit-container">
              <a mat-button routerLink="reset-password"> Reset Password </a>

              <button
                mat-raised-button
                type="submit"
                [disabled]="loginForm.invalid || loading()"
              >
                Login
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .mat-mdc-card-title {
        display: flex;
      }

      .mat-mdc-progress-spinner.title-spinner {
        max-height: 30px;
      }

      .login-container {
        align-items: center;
        display: flex;
        height: 100dvh;
        justify-content: center;
        min-height: 400px;
        padding: 15px;

        mat-card {
          max-width: 100%;
          width: 400px;

          form {
            display: flex;
            flex-direction: column;

            .submit-container {
              align-items: center;
              display: flex;
              justify-content: space-between;
            }
          }
        }
      }
    `,
  ],
})
export class LoginComponent {
  loading = inject(LoadingState).loading;
  loginForm = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private auth = inject(AuthService);
  private signInSubject$ = new Subject<{ email: string; password: string }>();
  signIn$ = this.signInSubject$.pipe(
    switchMap(({ email, password }) => this.auth.signIn(email, password)),
    tap((response) => this.handleSignInResponse(response)),
  );

  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.loading()) {
        this.loginForm.disable();
      } else {
        this.loginForm.enable();
      }
    });
  }

  signIn(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    if (email && password) {
      this.signInSubject$.next({ email, password });
    }
  }

  private handleSignInResponse(response: UserCredential | undefined): void {
    if (!response) {
      return;
    }

    this.router.navigate(['/']);
  }
}
