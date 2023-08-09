import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Subject, switchMap, tap } from 'rxjs';

import { ScannerDialogComponent } from './scanner-dialog/scanner-dialog.component';
import { Record } from '../core/models/record.model';
import { RecordService } from '../core/services/record.service';

@Component({
  selector: 'combi-scanner',
  standalone: true,
  imports: [
    AsyncPipe,
    MatDialogModule,
    NgIf,
    ScannerDialogComponent,
    ZXingScannerModule,
  ],
  template: `
    <ng-container *ngIf="record$ | async"></ng-container>

    <zxing-scanner (scanSuccess)="processCode($event)"></zxing-scanner>
  `,
})
export class ScannerComponent {
  private recordService = inject(RecordService);
  private recordSubject$ = new Subject<string>();
  record$ = this.recordSubject$.pipe(
    switchMap((email) => this.recordService.getRecord(email)),
    tap((record) => this.openScannerDialog(record)),
  );

  private scannedEmail = '';
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  processCode(scannedEmail: string): void {
    if (!scannedEmail || this.scannedEmail) {
      return;
    }

    this.scannedEmail = scannedEmail;

    this.recordSubject$.next(this.scannedEmail);
  }

  private openScannerDialog(data: Record | undefined): void {
    const dialogRef = this.dialog.open(ScannerDialogComponent, { data });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.scannedEmail = ''));
  }
}
