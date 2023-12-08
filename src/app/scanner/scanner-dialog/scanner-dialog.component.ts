import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

import { CombiRecord } from '../../core/models/record.model';

@Component({
  selector: 'combi-scanner-dialog',
  standalone: true,
  imports: [
    KeyValuePipe,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    NgFor,
    NgIf,
  ],
  template: `
    <h1 mat-dialog-title> Scanner Result </h1>
    <div mat-dialog-content>
      <ng-container *ngIf="recordAsAny; else noRecord">
        <div>
          <p> <b> Nombre: </b> {{ recordAsAny.name }} </p>
          <p> <b> Paquete: </b> {{ recordAsAny.paquetes }} </p>
          <p>
            <b> Polera: </b> {{ recordAsAny.poleras || 'NO CORRESPONDE' }}
          </p>
        </div>

        <mat-accordion>
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title> Record Data </mat-panel-title>
            </mat-expansion-panel-header>

            <p *ngFor="let item of record | keyvalue">
              <b> {{ item.key }}: </b> {{ item.value }}
            </p>
          </mat-expansion-panel>
        </mat-accordion>

        <img src="assets/img/success.png" alt="Success icon" />
      </ng-container>

      <ng-template #noRecord>
        {{ errorMessage }}

        <img src="assets/img/error.png" alt="Error icon" />
      </ng-template>
    </div>
    <div mat-dialog-actions>
      <button mat-button cdkFocusInitial (click)="close()"> Ok </button>
    </div>
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
