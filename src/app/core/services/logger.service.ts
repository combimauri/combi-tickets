import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private snackBar = inject(MatSnackBar);

  handleError(message: string): void {
    this.snackBar.open(message, 'dismiss');
  }
}
