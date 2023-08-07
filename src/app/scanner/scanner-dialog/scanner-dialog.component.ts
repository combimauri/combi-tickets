import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { Record } from '../../core/models/record.model';

@Component({
  selector: 'combi-scanner-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, NgIf],
  template: `
    <h1 mat-dialog-title> Scanner Result </h1>
    <div mat-dialog-content>
      <ng-container *ngIf="record; else noRecord">
        {{ record.name }}
      </ng-container>

      <ng-template #noRecord> No record with this email. </ng-template>
    </div>
    <div mat-dialog-actions>
      <button mat-button cdkFocusInitial (click)="close()"> Ok </button>
    </div>
  `,
})
export class ScannerDialogComponent {
  record: Record = inject(MAT_DIALOG_DATA);

  private dialogRef = inject(MatDialogRef<ScannerDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
