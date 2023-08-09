import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  UserCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  user,
} from '@angular/fire/auth';
import { Observable, catchError, finalize, from, map, of } from 'rxjs';

import { LoggerService } from './logger.service';
import { LoadingState } from '../states/loading.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loadingState = inject(LoadingState);
  private logger = inject(LoggerService);

  private auth: Auth = inject(Auth);
  user$ = user(this.auth);

  signIn(
    email: string,
    password: string,
  ): Observable<UserCredential | undefined> {
    this.loadingState.startLoading();

    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.handleError(error.message);

        return of(undefined);
      }),
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  signOut(): Observable<void | undefined> {
    this.loadingState.startLoading();

    return from(this.auth.signOut()).pipe(
      finalize(() => this.loadingState.stopLoading()),
    );
  }

  sendPasswordResetEmail(email: string): Observable<string | undefined> {
    this.loadingState.startLoading();

    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      map(() => {
        this.logger.handleSuccess('Reset password email sent.');

        return email;
      }),
      catchError((error: HttpErrorResponse) => {
        this.logger.handleError(error.message);

        return of(undefined);
      }),
      finalize(() => this.loadingState.stopLoading()),
    );
  }
}
