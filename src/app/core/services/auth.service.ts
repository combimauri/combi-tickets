import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  UserCredential,
  authState,
  signInWithEmailAndPassword,
  user,
} from '@angular/fire/auth';
import { Observable, catchError, from, of } from 'rxjs';

import { LoggerService } from './logger.service';

export type FirebaseErrorMessage = string;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private logger = inject(LoggerService);

  private auth: Auth = inject(Auth);
  authState$ = authState(this.auth);
  user$ = user(this.auth);

  signIn(
    email: string,
    password: string,
  ): Observable<UserCredential | undefined> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.handleError(error.message);

        return of(undefined);
      }),
    );
  }
}
