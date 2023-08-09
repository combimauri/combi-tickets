import { AsyncPipe, NgIf } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Subject, switchMap, tap } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { LoadingState } from '../../core/states/loading.state';

@Component({
  selector: 'combi-reset-password',
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
    <ng-container *ngIf="resetPassword$ | async"></ng-container>

    <div class="reset-password-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            Combi Tickets
            <mat-spinner *ngIf="loading()" class="title-spinner"></mat-spinner>
          </mat-card-title>

          <mat-card-subtitle> Reset Password </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="resetPasswordForm" (ngSubmit)="resetPassword()">
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" />
            </mat-form-field>

            <div class="submit-container">
              <a mat-button routerLink="/login"> Login </a>

              <button
                mat-raised-button
                type="submit"
                [disabled]="resetPasswordForm.invalid || loading()"
              >
                Reset Password
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

      .reset-password-container {
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
export class ResetPasswordComponent {
  loading = inject(LoadingState).loading;
  resetPasswordForm = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  private auth = inject(AuthService);
  private resetPasswordSubject$ = new Subject<string>();
  resetPassword$ = this.resetPasswordSubject$.pipe(
    switchMap((email) => this.auth.sendPasswordResetEmail(email)),
    tap((response) => this.handleResetPasswordResponse(response)),
  );

  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.loading()) {
        this.resetPasswordForm.disable();
      } else {
        this.resetPasswordForm.enable();
      }
    });
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { email } = this.resetPasswordForm.value;

    if (email) {
      this.resetPasswordSubject$.next(email);
    }
  }

  private handleResetPasswordResponse(response: unknown): void {
    if (!response) {
      return;
    }

    this.router.navigate(['/login']);
  }
}
