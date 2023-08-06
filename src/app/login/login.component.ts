import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, switchMap, tap } from 'rxjs';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'combi-login',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
  ],
  template: `
    <ng-container *ngIf="signIn$ | async"></ng-container>

    <mat-card>
      <mat-card-header>
        <mat-card-title> Combi Tickets </mat-card-title>
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
            <button
              mat-raised-button
              type="submit"
              [disabled]="loginForm.invalid"
            >
              Login
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      form {
        display: flex;
        flex-direction: column;

        .submit-container {
          display: flex;
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private auth = inject(AuthService);
  private signInSubject$ = new Subject<{ email: string; password: string }>();
  signIn$ = this.signInSubject$.asObservable().pipe(
    switchMap(({ email, password }) => this.auth.signIn(email, password)),
    tap((response) => this.handleSignInResponse(response)),
  );

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
  }
}
