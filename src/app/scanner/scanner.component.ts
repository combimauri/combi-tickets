import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Subject, of, switchMap, tap } from 'rxjs';

import { ScannerDialogComponent } from './scanner-dialog/scanner-dialog.component';
import { ScannerRegistrySelectorComponent } from './scanner-registry-selector/scanner-registry-selector.component';
import { CombiRecord } from '../core/models/record.model';
import { Registry } from '../core/models/registry.model';
import { RecordService } from '../core/services/record.service';
import { RegistryService } from '../core/services/registry.service';

@Component({
  selector: 'combi-scanner',
  standalone: true,
  imports: [
    AsyncPipe,
    MatDialogModule,
    NgIf,
    ScannerDialogComponent,
    ScannerRegistrySelectorComponent,
    ZXingScannerModule,
  ],
  template: `
    <ng-container *ngIf="record$ | async"></ng-container>

    <div class="header">
      <h1> Scanner </h1>

      <div class="dense">
        <combi-scanner-registry-selector
          [registries]="registries$ | async"
          (selectRegistry)="setSelectedRegistry($event)"
        ></combi-scanner-registry-selector>
      </div>
    </div>

    <div class="scanner-container">
      <zxing-scanner
        *ngIf="selectedRegistry; else noSelectedRegistry"
        (scanSuccess)="processCode($event)"
      ></zxing-scanner>

      <ng-template #noSelectedRegistry>
        <div class="video-skeleton">
          <h2> First select a registry </h2>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .scanner-container {
        display: flex;
        justify-content: center;

        .video-skeleton {
          align-items: center;
          background-color: gray;
          color: #ffffff;
          display: flex;
          justify-content: center;
        }
      }
    `,
  ],
})
export class ScannerComponent {
  private recordService = inject(RecordService);
  private recordSubject$ = new Subject<string>();
  record$ = this.recordSubject$.pipe(
    switchMap((email) => this.recordService.getRecordByEmail(email)),
    switchMap((record) => {
      if (record && this.selectedRegistry) {
        if (record['emiStudent'] === 'Si') {
          return of('EMI student.');
        }

        if (record[this.selectedRegistry.id]) {
          return of('The record was already registered.');
        }

        const data = { [this.selectedRegistry.id]: true };

        return this.recordService.updateRecord(record.email, data);
      }

      return of(undefined);
    }),
    tap((record) => this.openScannerDialog(record)),
  );

  registries$ = inject(RegistryService).getRegistries();
  selectedRegistry: Registry | undefined;

  private scannedEmail = '';
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  setSelectedRegistry(registry: Registry): void {
    this.selectedRegistry = registry;
  }

  processCode(scannedEmail: string): void {
    if (!scannedEmail || this.scannedEmail) {
      return;
    }

    this.scannedEmail = scannedEmail;

    this.recordSubject$.next(this.scannedEmail);
  }

  private openScannerDialog(
    data: Partial<CombiRecord> | string | undefined,
  ): void {
    const dialogRef = this.dialog.open(ScannerDialogComponent, { data });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.scannedEmail = ''));
  }
}
