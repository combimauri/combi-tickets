import {
  AsyncPipe,
  KeyValuePipe,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { CombiRecord } from '../../core/models/record.model';
import { LastScanState } from '../../core/services/last-scan.state';

@Component({
  selector: 'combi-scanner-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    KeyValuePipe,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    NgFor,
    NgIf,
    NgTemplateOutlet,
  ],
  template: `
    <h1 mat-dialog-title> Scanner Result </h1>
    <div mat-dialog-content>
      <ng-container *ngIf="recordAsAny; else noRecord">
        <div>
          <p> <b> NAME: </b> {{ recordAsAny.name }} </p>
          <p *ngIf="recordAsAny.notes">
            <b
              style="color: #ffba23; display: flex; justify-content: center; align-items: center"
            >
              <mat-icon>warning</mat-icon> NOTES:
            </b>
            {{ recordAsAny.notes }}
          </p>
        </div>

        <ng-template [ngTemplateOutlet]="recordData"></ng-template>

        <img src="assets/img/success.png" alt="Success icon" />
      </ng-container>

      <ng-template #noRecord>
        {{ errorMessage }}

        <ng-template [ngTemplateOutlet]="recordData"></ng-template>

        <img src="assets/img/error.png" alt="Error icon" />
      </ng-template>
    </div>
    <div mat-dialog-actions>
      <button mat-button cdkFocusInitial (click)="close()"> Ok </button>
    </div>

    <ng-template #recordData let-recordState>
      <mat-accordion *ngIf="lastScan$ | async as recordState">
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title> Record Data </mat-panel-title>
          </mat-expansion-panel-header>

          <p *ngFor="let item of recordState | keyvalue">
            <b> {{ item.key }}: </b> {{ item.value }}
          </p>
        </mat-expansion-panel>
      </mat-accordion>
    </ng-template>
  `,
  styles: [
    `
      .mat-mdc-dialog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class ScannerDialogComponent implements OnInit {
  record: Partial<CombiRecord> | string | undefined = inject(MAT_DIALOG_DATA);

  lastScan$ = inject(LastScanState).getLastScan();

  errorMessage = 'Error updating record.';

  get recordAsAny(): any {
    return this.record as any;
  }

  private dialogRef = inject(MatDialogRef<ScannerDialogComponent>);

  ngOnInit(): void {
    if (typeof this.record === 'string') {
      this.errorMessage = this.record;
      this.record = undefined;
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
