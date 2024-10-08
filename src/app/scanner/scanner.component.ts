import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Subject, of, switchMap, tap } from 'rxjs';

import { ScannerDialogComponent } from './scanner-dialog/scanner-dialog.component';
import { ScannerRegistrySelectorComponent } from './scanner-registry-selector/scanner-registry-selector.component';
import { CombiRecord } from '../core/models/record.model';
import { Registry } from '../core/models/registry.model';
import { LastScanState } from '../core/services/last-scan.state';
import { RecordService } from '../core/services/record.service';
import { RegistryService } from '../core/services/registry.service';

@Component({
  selector: 'combi-scanner',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    NgFor,
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

    <div
      *ngIf="selectedRegistry?.requiresId"
      style="width: 700px; max-width: 100%; margin: 0 auto"
    >
      <mat-form-field style="width: 100%;">
        <mat-label>RFID Number</mat-label>
        <input matInput type="number" [(ngModel)]="rfidNumber" />
      </mat-form-field>
    </div>

    <div class="scanner-container">
      <zxing-scanner
        *ngIf="
          selectedRegistry &&
            ((selectedRegistry?.requiresId && rfidNumber) ||
              !selectedRegistry?.requiresId);
          else noSelectedRegistry
        "
        (scanSuccess)="processCode($event)"
      ></zxing-scanner>

      <ng-template #noSelectedRegistry>
        <div class="video-skeleton">
          <h2>
            {{
              selectedRegistry
                ? 'Input the RFID number'
                : 'First select a registry'
            }}
          </h2>
        </div>
      </ng-template>
    </div>

    <!-- <div [hidden]="true">
      <ul>
        <li *ngFor="let record of checkedInRecords$ | async; index as i">
          {{ i + 1 }} - {{ record.email }}
        </li>
      </ul>
    </div> -->
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
  private lastScanState = inject(LastScanState);
  private recordService = inject(RecordService);
  private recordSubject$ = new Subject<string>();
  record$ = this.recordSubject$.pipe(
    switchMap((id) => this.recordService.getRecordById(id)),
    switchMap((record) => {
      if (record && this.selectedRegistry) {
        this.lastScanState.setLastScan(record);

        if (this.selectedRegistry.protected && !record['protectedAccess']) {
          return of('User has no access.');
        }

        if (!this.selectedRegistry.multi && record[this.selectedRegistry.id]) {
          return of('The record was already registered.');
        }

        // if (this.selectedRegistry.limit) {
        //   const position = Number(record['checkInPosition']);

        //   if (!position) {
        //     return of('The record was not checked in.');
        //   } else if (position > this.selectedRegistry.limit) {
        //     return of('The record is not allowed to register.');
        //   }
        // }

        let data: Partial<CombiRecord> = {
          ...record,
          [this.selectedRegistry.id]: true,
        };

        if (this.selectedRegistry.main) {
          data = { ...data, mainRegistryDate: new Date() };
        }

        if (this.selectedRegistry.requiresId) {
          const rfids = (data['rfidNumbers'] as any[]) || [];

          data = {
            ...data,
            rfidNumbers: [
              ...rfids,
              {
                number: this.rfidNumber,
                date: new Date(),
                registry: this.selectedRegistry.id,
              },
            ],
          };
        }

        return this.recordService.updateRecord(record.id, data);
      }

      return of(undefined);
    }),
    tap((record) => this.openScannerDialog(record)),
  );

  registries$ = inject(RegistryService).getRegistries();
  selectedRegistry?: Registry;
  rfidNumber?: number;

  // checkedInRecords$ = inject(RecordService)
  //   .getCheckedInRecords()
  //   .pipe(
  //     tap(
  //       (records) =>
  //         records?.forEach((record, index) => {
  //           const position = index + 1;

  //           if (record['checkInPosition'] === position) {
  //             return;
  //           }

  //           this.recordService
  //             .updateRecord(
  //               record.email,
  //               {
  //                 checkInPosition: position,
  //               },
  //               false,
  //             )
  //             .pipe(take(1))
  //             .subscribe();
  //         }),
  //     ),
  //   );

  private scannedId = '';
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  setSelectedRegistry(registry: Registry | undefined): void {
    this.rfidNumber = undefined;
    this.selectedRegistry = registry;
  }

  processCode(scannedId: string): void {
    if (!scannedId || this.scannedId) {
      return;
    }

    this.scannedId = scannedId;

    this.recordSubject$.next(this.scannedId);
  }

  private openScannerDialog(
    data: Partial<CombiRecord> | string | undefined,
  ): void {
    const dialogRef = this.dialog.open(ScannerDialogComponent, { data });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.scannedId = '';
        this.rfidNumber = undefined;
      });
  }
}
