import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { CombiRecord } from '../../core/models/record.model';

@Component({
  selector: 'combi-scanner-dialog',
  standalone: true,
  imports: [KeyValuePipe, MatButtonModule, MatDialogModule, NgFor, NgIf],
  template: `
    <h1 mat-dialog-title> Scanner Result </h1>
    <div mat-dialog-content>
      <ng-container *ngIf="record; else noRecord">
        <div>
          <p *ngFor="let item of record | keyvalue">
            <b> {{ item.key }}: </b> {{ item.value }}
          </p>
        </div>
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
