import { AsyncPipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, switchMap } from 'rxjs';

import { CombiRecord } from '../../core/models/record.model';
import { RecordService } from '../../core/services/record.service';
import { RegistryService } from '../../core/services/registry.service';
import { LoadingState } from '../../core/states/loading.state';
import { CredentialComponent } from '../../shared/credential/credential.component';

@Component({
  selector: 'combi-record-details',
  standalone: true,
  imports: [
    AsyncPipe,
    CredentialComponent,
    KeyValuePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    NgIf,
    NgFor,
  ],
  template: `
    <ng-container *ngIf="recordUpdate$ | async"></ng-container>

    <h1 mat-dialog-title> {{ record.name }} </h1>

    <div mat-dialog-content>
      <mat-card>
        <mat-card-header> Registries </mat-card-header>

        <mat-card-content>
          <mat-chip-listbox
            aria-label="Registries selection"
            class="mat-mdc-chip-set-stacked"
            multiple
            [disabled]="loading()"
          >
            <mat-chip-option
              *ngFor="let registry of registries$ | async"
              [selected]="record[registry.id] === true"
              (click)="toggleRegistry(registry.id)"
            >
              {{ registry.label }}
            </mat-chip-option>
          </mat-chip-listbox>
        </mat-card-content>
      </mat-card>

      <mat-accordion>
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title> Record Data </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="code__container">
            <combi-credential #credential [record]="record"></combi-credential>
          </div>

          <p *ngFor="let item of record | keyvalue">
            <b> {{ item.key }}: </b> {{ item.value }}
          </p>
        </mat-expansion-panel>
      </mat-accordion>
    </div>

    <div mat-dialog-actions class="actions-container">
      <button mat-button cdkFocusInitial (click)="close()"> Close </button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="loading()"
        (click)="credential.print()"
      >
        Download Credential
      </button>
    </div>
  `,
  styles: [
    `
      .mat-mdc-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .code__container {
        text-align: center;
        width: 100%;
      }

      .actions-container {
        align-items: center;
        display: flex;
        justify-content: space-between;
      }
    `,
  ],
})
export class RecordDetailsComponent {
  loading = inject(LoadingState).loading;
  record: CombiRecord = inject(MAT_DIALOG_DATA);
  registries$ = inject(RegistryService).getRegistries();

  private recordService = inject(RecordService);
  private recordUpdateSubject$ = new Subject<Partial<CombiRecord>>();
  recordUpdate$ = this.recordUpdateSubject$.pipe(
    switchMap((data) =>
      this.recordService.updateRecord(this.record.email, data),
    ),
  );

  private dialogRef = inject(MatDialogRef<RecordDetailsComponent>);

  toggleRegistry(registryId: string): void {
    const data = { [registryId]: !this.record[registryId] };

    this.recordUpdateSubject$.next(data);
  }

  close(): void {
    this.dialogRef.close();
  }
}
